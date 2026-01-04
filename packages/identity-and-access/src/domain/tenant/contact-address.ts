type Props = {
  email: string;
  phone: string;
  address: string;
};

class ContactInformation {
  email: string;

  phone: string;

  address: string;

  constructor(props: Props) {
    this.email = props.email;
    this.phone = props.phone;
    this.address = props.address;
  }
}

export { ContactInformation };
export type { Props as ContactInformationProps };
