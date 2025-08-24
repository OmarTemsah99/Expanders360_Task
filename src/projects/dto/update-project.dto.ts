import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectDto } from './create-project.dto';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
export class UpdateProjectDto extends PartialType(CreateProjectDto) {}
