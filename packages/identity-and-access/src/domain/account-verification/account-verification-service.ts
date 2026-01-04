type Props = {
  to: string;
};

class EmailVerification {
  from: string;

  to: string;

  subject: string;

  constructor(props: Props) {
    this.to = props.to;
    this.from = "org@email.com";
    this.subject = "Verificacao de conta...";
  }
}

interface AccountVerificationService {
  sendEmailVerification(emailVerification: EmailVerification): Promise<void>;
}

export { EmailVerification };
export type { AccountVerificationService };
