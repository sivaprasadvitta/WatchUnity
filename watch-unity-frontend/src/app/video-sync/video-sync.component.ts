import { Component, Input, OnInit, OnDestroy, SimpleChanges } from '@angular/core';
import { SocketService } from '../services/socket.service';
import { ActivatedRoute } from '@angular/router';

declare var YT: any;

@Component({
  selector: 'app-video-sync',
  templateUrl: './video-sync.component.html',
  styleUrls: ['./video-sync.component.scss']
})
export class VideoSyncComponent implements OnInit, OnDestroy {
  @Input() videoIdFromRoom = '';
  @Input() isHost: boolean = false;
  roomId: string = '';
  
  currentVideoId: string | null = "";
  player: any;
  lastTime: number = 0;
  isSeeking: boolean = false;
  // When true, onPlayerStateChange will not send socket events.
  suppressEvents: boolean = false;

  constructor(private socketService: SocketService, private route: ActivatedRoute) {
    this.route.paramMap.subscribe(params => {
      this.roomId = params.get('id') || '';
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['videoIdFromRoom']) {
      const newVideoId = changes['videoIdFromRoom'].currentValue;
      if (newVideoId && newVideoId !== this.currentVideoId) {
        this.currentVideoId = newVideoId;
        // console.log('ngOnChanges - videoIdFromRoom changed to:', newVideoId);
        if (this.player) {
          this.suppressEvents = true;
          this.player.loadVideoById(newVideoId);
        }
      }
    }
  }
  
  ngOnInit(): void {
    this.socketService.joinRoom(this.roomId);
    // console.log('Joined room:', this.roomId);

    // Listen for video control events
    this.socketService.onVideoControl((data: any) => {
      if (data.roomId !== this.roomId) return;
      // console.log('Received video control event:', data);
      
      switch (data.action) {
        case 'updateUrl':
          // console.log('Processing updateUrl event with videoId:', data.videoId);
          if (data.videoId && data.videoId !== this.currentVideoId) {
            this.currentVideoId = data.videoId;
            this.suppressEvents = true;
            if (this.player) {
              this.player.loadVideoById(data.videoId);
            }
          }
          break;
        case 'play':
          if (this.player) {
            this.player.playVideo();
          }
          break;
        case 'pause':
          if (this.player) {
            this.player.pauseVideo();
          }
          break;
        case 'seek':
          if (this.player) {
            this.player.seekTo(data.time, true);
          }
          break;
        default:
          break;
      }
    });

    this.loadYouTubeAPI();
  }

  loadYouTubeAPI() {
    if ((window as any).YT && (window as any).YT.Player) {
      this.initPlayer();
    } else {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
      (window as any).onYouTubeIframeAPIReady = () => {
        this.initPlayer();
      };
    }
  }

  initPlayer() {
    let playerWidth = '640';
    let playerHeight = '390';
    if (window.innerWidth <= 640) {
      playerWidth = window.innerWidth.toString();
      playerHeight = Math.round(window.innerWidth * (9 / 16)).toString();
    }

    this.player = new YT.Player('player', {
      height: playerHeight,
      width: playerWidth,
      videoId: this.currentVideoId || 'M7lc1UVf-VE',
      events: {
        onReady: this.onPlayerReady.bind(this),
        onStateChange: this.onPlayerStateChange.bind(this)
      }
    });
  }

  onPlayerReady(event: any) {
    // console.log('Player ready');
  }

  onPlayerStateChange(event: any): void {
    //  update, clear the flag and exit.
    if (this.suppressEvents) {
      this.suppressEvents = false;
      return;
    }

    const currentTime = this.player.getCurrentTime();
    if (this.isSeeking) return;

    // console.log('Player state changed, videoId:', event.target.options.videoId);

    if (event.data === YT.PlayerState.PLAYING) {
      this.socketService.sendVideoControl({
        roomId: this.roomId,
        action: 'play',
        time: currentTime,
        videoId: event.target.options.videoId
      });
    } 

    else if (event.data === YT.PlayerState.BUFFERING) {
      const timeDiff = Math.abs(currentTime - this.lastTime);
      if (timeDiff >= 1) {
        this.isSeeking = true;
        this.socketService.sendVideoControl({
          roomId: this.roomId,
          action: 'seek',
          time: currentTime,
          videoId: event.target.options.videoId
        });
        this.lastTime = currentTime;
        setTimeout(() => { this.isSeeking = false; }, 500);
      } else {
        this.lastTime = currentTime;
      }
    } 
    // else if (event.data === YT.PlayerState.PLAYING) {
    //   this.socketService.sendVideoControl({
    //     roomId: this.roomId,
    //     action: 'play',
    //     time: currentTime,
    //     videoId: event.target.options.videoId
    //   });
    // } 
    else if (event.data === YT.PlayerState.PAUSED) {
      this.socketService.sendVideoControl({
        roomId: this.roomId,
        action: 'pause',
        time: currentTime,
        videoId: event.target.options.videoId
      });
    }
  }

  updateVideoUrl(newVideoId: string) {
    // Update local player immediately and then emit to backend.
    this.currentVideoId = newVideoId;
    if (this.player) {
      this.suppressEvents = true;
      this.player.loadVideoById(newVideoId);
    }
    this.socketService.sendVideoControl({
      roomId: this.roomId,
      action: 'updateUrl',
      videoId: newVideoId
    });
  }

  ngOnDestroy(): void {
    this.socketService.socket.off('videoControl');
    this.socketService.socket.off('requestSync');
    this.socketService.socket.off('syncTime');

    localStorage.removeItem('adminName');
    localStorage.removeItem('joinerName');
    localStorage.removeItem('roomId');
    localStorage.removeItem('isHost');
  }
}
