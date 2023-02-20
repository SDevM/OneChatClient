import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { SocketService } from './services/socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  title = 'OneChatClient';
  msg = '';
  dmsg = '';
  name? = 'Anon';
  placename = 'Anon';
  upload: String = '';
  dmTarget = '';
  dmsgs: Message[] = [];
  dmBox = false;
  statusbarUp = true;
  onlineList: { id: string; name: string }[] = [];
  activeList: string[] = [];
  tone = new Audio('https://i.cloudup.com/E021I9zUG3.m4a');
  // TODO Add the new message rollout system to DMs
  // Figure out how much you can restrict the files bieng sent over

  constructor(private socketService: SocketService) {}

  ngAfterViewInit() {
    this.tone.volume = 0.25;
    this.socketService.on('backlog', (msgStack: Message[]) => {
      this.chatArea.nativeElement.innerHTML = '';
      if (msgStack)
        msgStack.forEach((msg, i) => {
          const message = this.messagePrep(msg);
          this.chatArea.nativeElement.appendChild(message);
          if (i == msgStack.length - 1) message.scrollIntoView();
        });
    });
    this.socketService.on('message', (new_msg: Message) => {
      const message = this.messagePrep(new_msg);
      this.chatArea.nativeElement.appendChild(message);
      message.scrollIntoView();
      // this.msgs.push(new_msg);
    });
    this.socketService.on(
      'online',
      (clients: { id: string; name: string }[]) => {
        this.onlineList = clients;
      }
    );
    this.socketService.on('loadDm', (msgs: Message[]) => {
      if (msgs) this.dmsgs = msgs;
    });
    this.socketService.on('directMessage', (msg: Message, me: string) => {
      if (this.dmBox && (this.dmTarget == msg.id || me == msg.id))
        this.dmsgs.push(msg);
      else {
        this.tone
          .play()
          .catch((err) => console.log('Message tone failed \n', err));
        if (!this.activeList.includes(msg.id)) this.activeList.push(msg.id);
      }
    });
    this.socketService.on('disconnect', () => {
      Swal.fire({
        title: 'Oops...',
        text: 'Your socket disconnected, time for a new identity',
        confirmButtonText: 'Reconnect',
      }).finally(location.reload);
    });
    this.socketService.name(this.name!);

    // ERRORS
    this.socketService.on('NAMETAKEN', () => {
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

  @ViewChild('chatArea') chatArea!: ElementRef<HTMLDivElement>;

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
    console.log(file);

    if (!file) return;
    this.socketService.message(this.msg, file);
    this.msg = '';
  }

  messagePrep(new_msg: Message): HTMLDivElement {
    const messageContainer = document.createElement('div');
    messageContainer.style.marginBottom = '20px';

    const sender = document.createElement('p');
    sender.style.color = '#f2f2f2';
    sender.style.fontWeight = 'bold';
    sender.style.marginBottom = '5px';
    sender.append(new_msg.owner);

    const message = document.createElement('div');
    message.style.display = 'flex';
    message.style.flexDirection = 'column';
    message.style.width = 'fit-content';
    message.style.backgroundColor = '#333';
    message.style.color = 'white';
    message.style.padding = '10px';
    message.style.border = '1px solid #222';
    message.style.borderRadius = '5px';
    message.style.backgroundImage = `linear-gradient(135deg, #222 25%, transparent 25%),
    linear-gradient(225deg, #222 25%, transparent 25%),
    linear-gradient(45deg, #222 25%, transparent 25%),
    linear-gradient(315deg, #222 25%, #333 25%)`;
    message.style.backgroundPosition = '8px 0, 8px 0, 0 0, 0 0';
    message.style.backgroundSize = '8px 8px';
    message.style.backgroundRepeat = 'repeat';
    message.append(new_msg.content);

    if (new_msg.image) {
      const img = document.createElement('img');
      img.src = `data:image/*;base64,${new_msg.image}`;
      img.style.maxWidth = '30vw';
      img.style.maxHeight = '50vh';
      message.appendChild(img);
    }

    messageContainer.appendChild(sender);
    messageContainer.appendChild(message);

    return messageContainer;
  }
}

interface Message {
  id: string;
  owner: string;
  content: string;
  image: string;
}
