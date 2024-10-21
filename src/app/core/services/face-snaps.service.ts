import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FaceSnap } from '../../core/models/face-snap.model';
import { map, Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FaceSnapsService {

  faceSnaps: FaceSnap[] = [];
  constructor(private http: HttpClient) {}


  getAllFaceSnaps(): Observable<FaceSnap[]> {
    return this.http.get<FaceSnap[]>('http://localhost:3000/facesnaps');
  }

  getFaceSnapById(faceSnapId: number): Observable<FaceSnap> {
    return this.http.get<FaceSnap>('http://localhost:3000/facesnaps/' + faceSnapId);
  }

  snapFaceSnapById(faceSnapId: number, snapType: 'snap' | 'unsnap'): Observable<FaceSnap> {
    return this.getFaceSnapById(faceSnapId).pipe(
      map((faceSnap: { snaps: string | number; }) => ({ 
        ...faceSnap,
        snaps: parseInt(faceSnap.snaps as string, 10) + (snapType === 'snap' ? 1 : -1)
      })),
      switchMap(updatedFaceSnap => this.http.put<FaceSnap>('http://localhost:3000/facesnaps/' + faceSnapId, updatedFaceSnap))
    )
  }

  addFaceSnap(formValue: { title: string, description: string, imageUrl: string, location?: string }): Observable<FaceSnap> {
    return this.getAllFaceSnaps().pipe(
      map((faceSnaps: FaceSnap[]) => [...faceSnaps].sort((a, b) => a.id - b.id)),
      map((sortedFaceSnaps: FaceSnap[]) => sortedFaceSnaps[sortedFaceSnaps.length - 1]),
      map(previousFacesnap =>({
        ...formValue,
        snaps: 0,
        createdDate: new Date(),
        id: previousFacesnap.id + 1
      })),
      switchMap(newFaceSnap => this.http.post<FaceSnap>('http://localhost:3000/facesnaps', newFaceSnap))
    );
  }
}
