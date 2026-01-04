type Props = {
  id: string;
  version?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

abstract class Entity {
  id: string;

  version: number;

  createdAt: Date;

  updatedAt: Date;

  constructor(props: Props) {
    this.id = props.id;
    this.version = props.version || 0;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }
}

export { Entity };
export type { Props as EntityProps };
