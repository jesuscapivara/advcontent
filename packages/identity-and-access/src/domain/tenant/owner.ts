import z from "zod";

type Props = {
  ownerId: string;
  email: string;
};

const Schema = z.object({
  ownerId: z.string(),
  email: z.email(),
});

class Owner {
  ownerId: string;

  email: string;

  constructor(props: Props) {
    this.ownerId = props.ownerId;
    this.email = props.email;

    Schema.parse(this);
  }
}

export { Owner };
export type { Props as OwnerProps };
