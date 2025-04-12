import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [FormsModule, NgIf,RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  userName: string | null = '';
  roomId: string | null = "";
  @Output() videoUrlChange = new EventEmitter<string>();

  videoUrl: string = '';
  error: string = '';

  constructor(public socketService: SocketService) {}

  ngOnInit(){
    this.userName = localStorage.getItem('adminName') || localStorage.getItem('joinerName');
    this.roomId = localStorage.getItem('roomId');
  }

  updateVideo() {
    if (this.videoUrl.trim()) {
      const videoId = this.socketService.extractVideoId(this.videoUrl.trim());
      if (videoId) {
        // console.log('Emitting updateUrl event with videoId:', videoId);
        // Emit the videoId to the parent component
        this.videoUrlChange.emit(videoId);
        // Also send the control event to backend
        this.socketService.sendVideoControl({ roomId: this.roomId, action: 'updateUrl', videoId });
        // Clear the input after update
        this.videoUrl = "";
      } else {
        console.error('Invalid YouTube URL');
      }
    }
  }

  onUpload(){}
}
