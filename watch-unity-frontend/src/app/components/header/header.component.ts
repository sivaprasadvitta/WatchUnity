import { Component, EventEmitter, inject, Input, Output, output } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [FormsModule,NgIf],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})


export class HeaderComponent {
  userName: string | null = '';
  roomId:string | null= ""
  @Output() videoUrlChange = new EventEmitter<string>();

  videoUrl: string = '';
  error: string = '';

  constructor(public socketService: SocketService) {
    
  }
  
  ngOnInit(){
    this.userName = localStorage.getItem('adminName')
    if(!this.userName){
      this.userName = localStorage.getItem('joinerName')
    }
    this.roomId = localStorage.getItem('roomId');
  }

  updateVideo() {
    if (this.videoUrl.trim()) {
      const videoId = this.socketService.extractVideoId(this.videoUrl.trim());
      if (videoId) {
        console.log('Emitting updateUrl event with videoId:', videoId);
        this.videoUrlChange.emit(videoId);
        this.socketService.sendVideoControl({ roomId: this.roomId, action: 'updateUrl', videoId });
      } else {
        console.error('Invalid YouTube URL');
      }
    }
  }
  
}
