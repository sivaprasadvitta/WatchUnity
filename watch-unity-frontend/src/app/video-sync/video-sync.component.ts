import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { SocketService } from '../services/socket.service';

declare var YT: any;

@Component({
  selector: 'app-video-sync',
  templateUrl: './video-sync.component.html',
  styleUrls: ['./video-sync.component.scss']
})
export class VideoSyncComponent implements OnInit, OnDestroy, OnChanges {
  @Input() roomId: string = 'room1';
  @Input() initialVideoUrl: string = 'M7lc1UVf-VE';  // Default YouTube video ID
  @Input() isHost: boolean = false;

  currentVideoId: string = this.initialVideoUrl;
  player: any;
  lastTime: number = 0;
  isSeeking: boolean = false;
  pollIntervalId: any;

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
    // Join the designated room
    this.socketService.joinRoom(this.roomId);
    console.log('Joined room:', this.roomId);

    // Set up socket listener for video control events
    this.socketService.onVideoControl((data: any) => {
      if (data.roomId !== this.roomId || !this.player) return;
      console.log('Received video control event:', data);
      switch (data.action) {
        case 'play':
          this.player.playVideo();
          break;
        case 'pause':
          this.player.pauseVideo();
          break;
        case 'seek':
          this.player.seekTo(data.time, true);
          break;
        case 'updateUrl':
          this.currentVideoId = data.videoId;
          this.player.loadVideoById(data.videoId);
          break;
        default:
          break;
      }
    });

    // For new joiners, request a sync from the host if not host
    if (!this.isHost) {
      setTimeout(() => {
        console.log('Requesting sync from host');
        this.socketService.socket.emit('requestSync', { roomId: this.roomId });
      }, 1000);
    } else {
      // Host responds to sync requests
      this.socketService.onRequestSync((data: any) => {
        if (data.roomId === this.roomId && this.player) {
          const currentTime = this.player.getCurrentTime();
          console.log('Host responding with syncTime:', currentTime);
          this.socketService.sendSyncTime({ roomId: this.roomId, time: currentTime });
        }
      });
    }

    this.loadYouTubeAPI();
  }

  loadYouTubeAPI() {
    // Check if the YT object and its Player constructor are available
    if ((window as any).YT && (window as any).YT.Player) {
      this.initPlayer();
    } else {
      // Dynamically add the YouTube IFrame API script
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
      // onYouTubeIframeAPIReady will be called by the API once it's loaded
      (window as any).onYouTubeIframeAPIReady = () => {
        this.initPlayer();
      };
    }
  }

  initPlayer() {
    // Create the player using the current video ID
    this.player = new YT.Player('player', {
      height: '390',
      width: '640',
      videoId: this.currentVideoId,
      events: {
        onReady: this.onPlayerReady.bind(this),
        onStateChange: this.onPlayerStateChange.bind(this)
      }
    });
  }

  onPlayerReady(event: any) {
    console.log('Player ready');
    // Optionally, you can auto-play or perform additional setup here
  }

  onPlayerStateChange(event: any): void {
    console.log('Player state change event:', event);
    const currentTime = this.player.getCurrentTime();
    if (this.isSeeking) return;

    // Detect buffering state to infer a manual seek
    if (event.data === YT.PlayerState.BUFFERING) {  // BUFFERING equals 3
      const timeDiff = Math.abs(currentTime - this.lastTime);
      console.log(`Last time: ${this.lastTime}, Current time: ${currentTime}, Diff: ${timeDiff}`);
      if (timeDiff >= 2) {
        console.log(`Detected manual seek from ${this.lastTime} to ${currentTime}`);
        this.isSeeking = true;
        this.socketService.sendVideoControl({ roomId: this.roomId, action: 'seek', time: currentTime });
        this.lastTime = currentTime;
        setTimeout(() => { this.isSeeking = false; }, 500);
      } else {
        this.lastTime = currentTime;
      }
    }
    else if (event.data === YT.PlayerState.PLAYING) {
      console.log(`Video playing at ${currentTime}`);
      this.socketService.sendVideoControl({ roomId: this.roomId, action: 'play', time: currentTime });
      // this.lastTime = currentTime;
    }
    else if (event.data === YT.PlayerState.PAUSED) {
      console.log(`Video paused at ${currentTime}`);
      this.socketService.sendVideoControl({ roomId: this.roomId, action: 'pause', time: currentTime });
      // this.lastTime = currentTime;
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






















// import { Component, Input, OnInit, OnDestroy, SimpleChanges } from '@angular/core';
// import { SocketService } from '../services/socket.service';

// declare var YT: any;

// @Component({
//   selector: 'app-video-sync',
//   templateUrl: './video-sync.component.html',
//   styleUrls: ['./video-sync.component.scss']
// })
// export class VideoSyncComponent implements OnInit, OnDestroy {
//   @Input() roomId: string = 'room1';
//   @Input() initialVideoUrl: string = 'M7lc1UVf-VE';
//   @Input() isHost: boolean = false;

//   currentVideoId: string = 'M7lc1UVf-VE';
//   player: any;
//   lastTime: number = 0;
//   isSeeking: boolean = false;

//   constructor(private socketService: SocketService) {}

//   ngOnChanges(changes: SimpleChanges) {
//     if (changes['initialVideoUrl']) {
//       this.currentVideoId = changes['initialVideoUrl'].currentValue;
//       console.log('Video URL updated to:', this.currentVideoId);
//       if (this.player) {
//         this.player.loadVideoById(this.currentVideoId);
//       }
//     }
//   }

//   ngOnInit(): void {
//     this.currentVideoId = this.initialVideoUrl;
//     this.socketService.joinRoom(this.roomId);

//     this.socketService.onVideoControl((data: any) => {
//       if (data.roomId !== this.roomId || !this.player) return;
//       switch (data.action) {
//         case 'play': this.player.playVideo(); break;
//         case 'pause': this.player.pauseVideo(); break;
//         case 'seek': this.player.seekTo(data.time, true); break;
//         case 'updateUrl':
//           this.currentVideoId = data.videoId;
//           this.player.loadVideoById(data.videoId);
//           break;
//       }
//     });

//     if (this.isHost) {
//       this.socketService.onRequestSync((data: any) => {
//         if (data.roomId === this.roomId && this.player) {
//           const currentTime = this.player.getCurrentTime();
//           this.socketService.sendSyncTime({ roomId: this.roomId, time: currentTime });
//         }
//       });
//     } else {
//       setTimeout(() => {
//         this.socketService.socket.emit('requestSync', { roomId: this.roomId });
//       }, 1000);
//     }

//     this.loadYouTubeAPI();
//   }

//   loadYouTubeAPI() {
//     if (!(window as any).YT || !(window as any).YT.Player) {
//       const tag = document.createElement('script');
//       tag.src = 'https://www.youtube.com/iframe_api';
//       document.body.appendChild(tag);
//     }
//     (window as any).onYouTubeIframeAPIReady = () => this.initPlayer();
//   }

//   initPlayer() {
//     this.player = new YT.Player('player', {
//       height: '390',
//       width: '640',
//       videoId: this.currentVideoId || 'M7lc1UVf-VE',
//       events: {
//         onStateChange: this.onPlayerStateChange.bind(this)
//       }
//     });
//   }

//   onPlayerStateChange(event: any): void {
//     const currentTime = this.player.getCurrentTime();
//     if (this.isSeeking) return;

//     if (event.data === YT.PlayerState.BUFFERING) {
//       const timeDiff = Math.abs(currentTime - this.lastTime);
//       if (timeDiff >= 2) {
//         this.isSeeking = true;
//         this.socketService.sendVideoControl({ roomId: this.roomId, action: 'seek', time: currentTime });
//         this.lastTime = currentTime;
//         setTimeout(() => this.isSeeking = false, 500);
//       } else {
//         this.lastTime = currentTime;
//       }
//     } else if (event.data === YT.PlayerState.PLAYING) {
//       this.socketService.sendVideoControl({ roomId: this.roomId, action: 'play', time: currentTime });
//     } else if (event.data === YT.PlayerState.PAUSED) {
//       this.socketService.sendVideoControl({ roomId: this.roomId, action: 'pause', time: currentTime });
//     }
//   }

//   updateVideoUrl(newVideoId: string) {
//     this.currentVideoId = newVideoId;
//     if (this.player) {
//       this.player.loadVideoById(newVideoId);
//     }
//     this.socketService.sendVideoControl({ roomId: this.roomId, action: 'updateUrl', videoId: newVideoId });
//   }

//   ngOnDestroy(): void {
//     this.socketService.socket.off('videoControl');
//     this.socketService.socket.off('requestSync');
//     this.socketService.socket.off('syncTime');
//   }
// }
