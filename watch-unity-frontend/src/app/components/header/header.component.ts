import { Component, EventEmitter, inject, Input, Output, output } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [FormsModule,NgIf],
  templateUrl: './header.component.html',
})


export class HeaderComponent {
  @Input() userName: string = '';
  @Output() videoUrlChange = new EventEmitter<string>();

  videoUrl: string = '';
  error: string = '';

  constructor(public socketService: SocketService) {}

  updateVideo() {
    const videoId = this.socketService.extractVideoId(this.videoUrl.trim());
    if (videoId) {
      console.log('Video ID:', videoId);
      this.videoUrlChange.emit(videoId);
    } else {
      this.error = 'Invalid YouTube URL!';
    }
  }
}
