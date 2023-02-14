import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  constructor(private socket: Socket) {}

  on(event: string, callback: Function) {
    this.socket.on(event, callback);
  }

  message(msg: string) {
    this.socket.emit('message', msg);
  }

  online() {
    this.socket.emit('online');
  }

  name(name: string) {
    this.socket.emit('name', name);
  }
}
