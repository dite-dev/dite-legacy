import { render } from '@dite/vue/render';
import { Controller, Get, Header } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/api')
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/')
  @Header('Content-Type', 'text/html')
  async home(): Promise<string> {
    const html = await render('/');
    return html;
  }
}
