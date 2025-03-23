import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges, inject, Host } from '@angular/core';
import { SocketService } from '../services/socket.service';
import { ActivatedRoute } from '@angular/router';

declare var YT: any;

@Component({
  selector: 'app-video-sync',
  templateUrl: './video-sync.component.html',
  styleUrls: ['./video-sync.component.scss']
})
export class VideoSyncComponent implements OnInit, OnDestroy, OnChanges {

  roomId: string = '';


  @Input() initialVideoUrl: string = 'M7lc1UVf-VE'; 
  @Input() isHost: boolean = false;

  currentVideoId: string = this.initialVideoUrl;
  player: any;
  lastTime: number = 0;
  isSeeking: boolean = false;
  pollIntervalId: any;

  checker:string | null =''; //to check host or not

  constructor(private socketService: SocketService, private route: ActivatedRoute) {
    this.route.paramMap.subscribe(params => {
      console.log(params.get('id'));
      this.roomId = params.get('id') || '';
    });
  }

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
          console.log('Received updateUrl event with videoId:', data.videoId);
          this.currentVideoId = data.videoId;
          if (this.player) {
            this.player.loadVideoById(data.videoId);
          }
          break;
        default:
          break;
      }
    });

    // check that that the user is host ot not first
    this.checker = localStorage.getItem('isHost');
    if(this.checker == 'true'){
        this.isHost = true;
    }

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
    let playerWidth = '640';
    let playerHeight = '390';
    if (window.innerWidth <= 640) {
      // For mobile, set width to full window width and calculate height based on 16:9 ratio or use window height
      playerWidth = window.innerWidth.toString();
      // For a 16:9 ratio:
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

    // clear our value
    localStorage.removeItem('adminName');
    localStorage.removeItem('joinerName');
    localStorage.removeItem('roomId');
    localStorage.removeItem('isHost');
  }
}



