import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { SocketIoModule } from 'ngx-socket-io';
import { environment } from 'src/environments/environment';

import { AppComponent } from './app.component';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    FormsModule,
    MatIconModule,
    SocketIoModule.forRoot({
      url: environment.socketUrl,
      options: {
        transports: ['websocket'],
      },
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
