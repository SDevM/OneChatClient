import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { SocketService } from './services/socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'OneChatClient';
  msg = '';
  dmsg = '';
  name? = 'Anon';
  placename = 'Anon';
  upload: String = '';
  msgs: Message[] = [];
  dmTarget = '';
  dmsgs: Message[] = [];
  dmBox = false;
  statusbarUp = true;
  onlineList: { id: string; name: string }[] = [];
  activeList: string[] = [];
  tone = new Audio('https://i.cloudup.com/E021I9zUG3.m4a');
  constructor(private socketService: SocketService) {
    this.tone.volume = 0.25;
    socketService.on('backlog', (msgStack: Message[]) => {
      console.log(msgStack[msgStack.length - 1]);

      if (msgStack) this.msgs = msgStack;
    });
    socketService.on('message', (new_msg: Message) => {
      this.msgs.push(new_msg);
    });
    socketService.on('online', (clients: { id: string; name: string }[]) => {
      this.onlineList = clients;
    });
    socketService.on('loadDm', (msgs: Message[]) => {
      if (msgs) this.dmsgs = msgs;
    });
    socketService.on('directMessage', (msg: Message, me: string) => {
      if (this.dmBox && (this.dmTarget == msg.id || me == msg.id))
        this.dmsgs.push(msg);
      else {
        this.tone
          .play()
          .catch((err) => console.log('Message tone failed \n', err));
        if (!this.activeList.includes(msg.id)) this.activeList.push(msg.id);
      }
    });
    socketService.name(this.name!);

    // ERRORS
    socketService.on('NAMETAKEN', () => {
      this.name = 'Anon';
      this.placename = 'Anon';
      Swal.fire({
        toast: true,
        title: "We're sorry...",
        text: 'The name you chose is already in use!',
        timer: 2500,
      });
    });
  }

  submit() {
    this.socketService.message(this.msg);
    this.msg = '';
  }
  rename() {
    this.socketService.name(this.name!);
    this.placename = this.name!;
    this.name = undefined;
  }
  dmOpen(id: string) {
    this.dmTarget = id;
    this.activeList = this.activeList.filter((val) => {
      val != this.dmTarget;
    });
    this.dmBox = true;
    this.socketService.loadDirect(id);
  }
  dm() {
    this.socketService.directMessage(this.dmTarget, this.dmsg);
    this.dmsg = '';
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.socketService.message(this.msg, file);
    this.msg = '';
  }
}

interface Message {
  id: string;
  owner: string;
  content: string;
  image: string;
}
