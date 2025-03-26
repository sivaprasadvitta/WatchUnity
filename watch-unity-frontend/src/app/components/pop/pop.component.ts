import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../services/room.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-pop',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './pop.component.html',
  styleUrls: ['./pop.component.css']
})

export class PopComponent {
  createrName: string = '';
  joinerName: string = '';
  roomId: string = '';
  task: string = '';
  isLoading: boolean = false;

  constructor(private route: ActivatedRoute, private router: Router, private roomService: RoomService) {
    this.route.paramMap.subscribe(params => {
      this.task = params.get('task') || '';
    });
  }

  onCreateRoom() {
    if (!this.createrName.trim()) return;
    
    this.isLoading = true;
    localStorage.setItem('adminName', this.createrName);
    
    this.roomService.createRoom().subscribe({
      next: (generatedRoomId: string) => {
        localStorage.setItem('isHost', 'true');
        localStorage.setItem('roomId', generatedRoomId);
        this.router.navigate([`/room/${generatedRoomId}`]);
      },
      error: () => this.isLoading = false,
      complete: () => this.isLoading = false
    });
  }

  onJoinRoom() {
    if (!this.joinerName.trim() || !this.roomId.trim()) return;

    this.isLoading = true;
    localStorage.setItem('joinerName', this.joinerName);
    localStorage.setItem('roomId', this.roomId);

    this.roomService.joinRoom(this.roomId).subscribe({
      next: (roomId: string) => this.router.navigate([`/room/${roomId}`]),
      error: () => this.isLoading = false,
      complete: () => this.isLoading = false
    });
  }
}
