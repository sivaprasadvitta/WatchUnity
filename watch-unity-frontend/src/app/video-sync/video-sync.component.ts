import { Component, Input, OnInit, OnDestroy, SimpleChanges } from '@angular/core';
import { SocketService } from '../services/socket.service';

declare var YT: any;

@Component({
  selector: 'app-video-sync',
  templateUrl: './video-sync.component.html',
  styleUrls: ['./video-sync.component.scss']
})
export class VideoSyncComponent implements OnInit, OnDestroy {
  @Input() roomId: string = 'room1';
  @Input() initialVideoUrl: string = 'M7lc1UVf-VE';
  @Input() isHost: boolean = false;

  currentVideoId: string = 'M7lc1UVf-VE';
  player: any;
  lastTime: number = 0;
  isSeeking: boolean = false;

  constructor(private socketService: SocketService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialVideoUrl']) {
      this.currentVideoId = changes['initialVideoUrl'].currentValue;
      console.log('Video URL updated to:', this.currentVideoId);
      if (this.player) {
        this.player.loadVideoById(this.currentVideoId);
      }
    }
  }

  ngOnInit(): void {
    this.currentVideoId = this.initialVideoUrl;
    this.socketService.joinRoom(this.roomId);

    this.socketService.onVideoControl((data: any) => {
      if (data.roomId !== this.roomId || !this.player) return;
      switch (data.action) {
        case 'play': this.player.playVideo(); break;
        case 'pause': this.player.pauseVideo(); break;
        case 'seek': this.player.seekTo(data.time, true); break;
        case 'updateUrl':
          this.currentVideoId = data.videoId;
          this.player.loadVideoById(data.videoId);
          break;
      }
    });

    if (this.isHost) {
      this.socketService.onRequestSync((data: any) => {
        if (data.roomId === this.roomId && this.player) {
          const currentTime = this.player.getCurrentTime();
          this.socketService.sendSyncTime({ roomId: this.roomId, time: currentTime });
        }
      });
    } else {
      setTimeout(() => {
        this.socketService.socket.emit('requestSync', { roomId: this.roomId });
      }, 1000);
    }

    this.loadYouTubeAPI();
  }

  loadYouTubeAPI() {
    if (!(window as any).YT || !(window as any).YT.Player) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }
    (window as any).onYouTubeIframeAPIReady = () => this.initPlayer();
  }

  initPlayer() {
    this.player = new YT.Player('player', {
      height: '390',
      width: '640',
      videoId: this.currentVideoId || 'M7lc1UVf-VE',
      events: {
        onStateChange: this.onPlayerStateChange.bind(this)
      }
    });
  }

  onPlayerStateChange(event: any): void {
    const currentTime = this.player.getCurrentTime();
    if (this.isSeeking) return;

    if (event.data === YT.PlayerState.BUFFERING) {
      const timeDiff = Math.abs(currentTime - this.lastTime);
      if (timeDiff >= 2) {
        this.isSeeking = true;
        this.socketService.sendVideoControl({ roomId: this.roomId, action: 'seek', time: currentTime });
        this.lastTime = currentTime;
        setTimeout(() => this.isSeeking = false, 500);
      } else {
        this.lastTime = currentTime;
      }
    } else if (event.data === YT.PlayerState.PLAYING) {
      this.socketService.sendVideoControl({ roomId: this.roomId, action: 'play', time: currentTime });
    } else if (event.data === YT.PlayerState.PAUSED) {
      this.socketService.sendVideoControl({ roomId: this.roomId, action: 'pause', time: currentTime });
    }
  }

  updateVideoUrl(newVideoId: string) {
    this.currentVideoId = newVideoId;
    if (this.player) {
      this.player.loadVideoById(newVideoId);
    }
    this.socketService.sendVideoControl({ roomId: this.roomId, action: 'updateUrl', videoId: newVideoId });
  }

  ngOnDestroy(): void {
    this.socketService.socket.off('videoControl');
    this.socketService.socket.off('requestSync');
    this.socketService.socket.off('syncTime');
  }
}
