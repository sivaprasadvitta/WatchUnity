import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.prod';

import { Observable } from 'rxjs';

export interface Room {
  _id?: string;
  name: string;
  videoUrl: string;
  createdBy: string;
  participants: string[];
}

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private apiUrl = `${'https://watchunity-backend.onrender.com'}/rooms`;

  constructor(private http: HttpClient) {}

 
  createRoom(){
    return  this.http.get<string>(`${this.apiUrl}/create`);
  }

  joinRoom(roomId: string) {
    return this.http.get<string>(`${this.apiUrl}/join?roomId=${roomId}`);
  }


  // createRoom(room: Room): Observable<Room> {
  //   return this.http.post<Room>(this.apiUrl, room);
  // }

  // getRooms(): Observable<Room[]> {
  //   return this.http.get<Room[]>(this.apiUrl);
  // }

  // joinRoom(roomId: string, userId: string): Observable<Room> {
  //   return this.http.post<Room>(`${this.apiUrl}/join`, { roomId, userId });
  // }
}
