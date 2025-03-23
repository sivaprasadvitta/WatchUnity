import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.prod';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private apiUrl = `${'https://watchunity-backend.onrender.com'}/rooms`;

  constructor(private http: HttpClient) {}

  createRoom(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/create`);
  }

  joinRoom(roomId: string): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/join?roomId=${roomId}`);
  }
}
