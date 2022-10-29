import { Controller } from '@nestjs/common';
import { CompaniesService } from './company.service';

@Controller('companies')
export class CompaniesController {
  constructor(public service: CompaniesService) {}
}
