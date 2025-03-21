import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
// import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  socket: Socket;
  private regex = /(?:youtube\.com\/(?:.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  videoId:string | null="";

  constructor() {
    this.socket = io('https://watchunity-backend.onrender.com');
  }

  joinRoom(roomId: string) {
    this.socket.emit('joinRoom', roomId);
  }

  sendVideoControl(data: any) {
    this.socket.emit('videoControl', data);
  }

  onVideoControl(callback: (data: any) => void) {
    this.socket.on('videoControl', callback);
  }

  // New methods for syncing new joiners
  sendSyncTime(data: any) {
    this.socket.emit('syncTime', data);
  }
  
  onSyncTime(callback: (data: any) => void) {
    this.socket.on('syncTime', callback);
  }
  
  onRequestSync(callback: (data: any) => void) {
    this.socket.on('requestSync', callback);
  }


  extractVideoId(videoUrl: string): string | null {
    const match = videoUrl.match(this.regex);
    this.videoId = match && match[1] ? match[1] : null;
    return match && match[1] ? match[1] : null;
  }
  
}




// import { Injectable } from '@angular/core';
// import { io, Socket } from 'socket.io-client';
// // import { environment } from '../environments/environment';

// @Injectable({
//   providedIn: 'root'
// })
// export class SocketService {
//   socket: Socket;

//   constructor() {
//     this.socket = io('http://localhost:5000');
//   }

//   joinRoom(roomId: string) {
//     this.socket.emit('joinRoom', roomId);
//   }

//   sendVideoControl(data: any) {
//     this.socket.emit('videoControl', data);
//   }

//   // onVideoControl(callback: (data: any) => void) {
//   //   this.socket.on('videoControl', callback);
//   // }

//   onVideoControl(callback: (data: any) => void) {
//     this.socket.on('videoControl', (data: any) => {
//       console.log('Received videoControl event:', data);
//       callback(data);
//     });
//   }
// }
