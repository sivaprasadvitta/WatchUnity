import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RoomService } from '../../services/room.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-pop',
  standalone: true,
  imports: [FormsModule,NgIf],
  templateUrl: './pop.component.html',
  styleUrls: ['./pop.component.css']
})


export class PopComponent {
  createrName: string = '';
  joinerName: string = '';
  roomId: string = '';
  task: string = '';

  constructor(private route: ActivatedRoute, private router: Router, private roomService: RoomService) {
    this.route.paramMap.subscribe(params => {
      this.task = params.get('task') || '';
    });
  }


  onCreateRoom() {
    localStorage.setItem('adminName', this.createrName);
    this.roomService.createRoom().subscribe((generatedRoomId: string) => {
      localStorage.setItem('isHost','true');
      localStorage.setItem('roomId', generatedRoomId);
      this.router.navigate([`/room/${generatedRoomId}`]);
    });
  }

  onJoinRoom() {
    localStorage.setItem('joinerName', this.joinerName);
    localStorage.setItem('roomId', this.roomId);
    this.roomService.joinRoom(this.roomId).subscribe((roomId: string) => {
      this.router.navigate([`/room/${roomId}`]);
    });
  }
}
