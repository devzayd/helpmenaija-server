import { ISession } from "connect-typeorm";
import {
  BaseEntity,
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from "typeorm";

@Entity()
export class SessionEntity extends BaseEntity implements ISession {
  @Index()
  @Column("bigint")
  expiredAt = Date.now();

  @PrimaryColumn("varchar", { length: 255 })
  id: string;

  @Column("text", { nullable: true })
  json: string;

  @DeleteDateColumn()
  destroyedAt?: Date;
}
