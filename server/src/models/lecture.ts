import { Entity, Column, OneToMany, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { CourseEvent } from './courseLecture';

@Entity()
export class Event {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  descriptionUrl: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 'regular' })
  type: string;

  @OneToMany(_ => CourseEvent, (courseLecture: CourseEvent) => courseLecture.event, { nullable: true })
  courseLectures: CourseEvent[] | null;
}
