import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth";
import { requireCompanyRole } from "../../middleware/rbac";
import { CompaniesService } from "./companies.service";
import { t } from "../../config/i18n";

export const companiesRouter = Router();

companiesRouter.use(requireAuth);

companiesRouter.get("/", async (req, res) => {
  const user = req.authUser!;
  const companies = await CompaniesService.listForUser(user.id);
  return res.json({ items: companies });
});

const createCompanySchema = z.object({
  name: z.string().min(1),
  timezone: z.string().min(1),
});

companiesRouter.post("/", async (req, res) => {
  const user = req.authUser!;

  const parseResult = createCompanySchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: t().errors.invalidInput });
  }

  const company = await CompaniesService.createCompany({
    ownerUserId: user.id,
    name: parseResult.data.name,
    timezone: parseResult.data.timezone,
  });

  return res.status(201).json(company);
});

const createInviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["OWNER", "ADMIN", "MEMBER", "VIEWER"]),
});

companiesRouter.post(
  "/:companyId/invites",
  requireCompanyRole(["OWNER", "ADMIN"]),
  async (req, res) => {
    const user = req.authUser!;
    const { companyId } = req.params;

    if (!user.companyId || user.companyId !== companyId) {
      return res.status(403).json({ error: t().errors.forbidden });
    }

    const parseResult = createInviteSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: t().errors.invalidInput });
    }

    const invite = await CompaniesService.createInvite({
      companyId,
      email: parseResult.data.email,
      role: parseResult.data.role,
    });

    // В реальной системе здесь должна быть отправка email.

    return res.status(201).json({
      inviteId: invite.id,
      message: t().invites.inviteSent,
    });
  }
);

const acceptInviteSchema = z.object({
  token: z.string().min(1),
});

companiesRouter.post("/accept-invite", async (req, res) => {
  const user = req.authUser!;
  const parseResult = acceptInviteSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: t().errors.invalidInput });
  }

  const result = await CompaniesService.acceptInvite({
    userId: user.id,
    token: parseResult.data.token,
  });

  if (!result) {
    return res.status(400).json({ error: t().invites.inviteInvalid });
  }

  return res.json({
    message: t().invites.inviteAccepted,
    companyId: result.invite.companyId,
    role: result.membership.role,
  });
});

