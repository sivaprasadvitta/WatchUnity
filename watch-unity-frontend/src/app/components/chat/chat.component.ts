import { Component, Input } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-chat',
  imports: [NgFor,FormsModule,NgClass,NgIf],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {
  // @Input() roomId:string='';
  // @Input() userName:string="";
  roomId:string | null= ''
  userName :string | null='Anonymous'

  message: string = '';
  messages: { sender: string, text: string, timestamp: Date }[] = [];

  constructor(private socketService: SocketService) {}

  ngOnInit() {
    this.roomId = localStorage.getItem('roomId');
    this.userName = localStorage.getItem('adminName')
    if(!this.userName ){
      this.userName = localStorage.getItem('joinerName');
    }

    this.socketService.onChatMessage((msg) => {
      this.messages.push(msg);
    });
  }

  sendMessage() {
    if (this.message.trim()) {
      const chatMessage = {
        roomId: this.roomId || '',
        sender: this.userName || '',
        text: this.message,
        timestamp: new Date()
      };
      this.socketService.sendChatMessage(chatMessage);
      this.messages.push(chatMessage);
      this.message = '';
    }
  }
  

}
