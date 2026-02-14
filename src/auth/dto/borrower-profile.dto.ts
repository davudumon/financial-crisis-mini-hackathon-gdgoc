export class BorrowerProfileDto {
  id!: string;
  name!: string;
  email!: string | null;
  phoneNumber!: string | null;
  businessType!: string | null;
  createdAt!: Date;
}
