import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import * as mapboxgl from 'mapbox-gl';

interface MarcadorColor {
  color: string;
  marker?: mapboxgl.Marker;
  centro?: [number, number];
}

@Component({
  selector: 'app-marcadores',
  templateUrl: './marcadores.component.html',
  styles: [
    `
      .mapa-container {
        height: 100%;
        width: 100%;
      }
      .list-group {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 99;
      }
      li {
        cursor: pointer;
      }
    `,
  ],
})
export class MarcadoresComponent implements AfterViewInit {
  @ViewChild('mapa') divMapa!: ElementRef;
  mapa!: mapboxgl.Map;
  zoomLevel: number = 15;
  center: [number, number] = [-4.756796715345765, 37.89448403213783];
  marcadores: MarcadorColor[] = [];

  constructor() {}
  ngAfterViewInit(): void {
    this.mapa = new mapboxgl.Map({
      container: this.divMapa.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: this.center,
      zoom: this.zoomLevel,
    });
    this.leerMarcadoresLocalStorae();

    /* const marker = new mapboxgl.Marker()
      .setLngLat(this.center)
      .addTo(this.mapa); */
  }

  irMarcador(marekr: mapboxgl.Marker) {
    this.mapa.flyTo({
      center: marekr.getLngLat(),
    });
  }

  agregarMarcador() {
    const color = '#xxxxxx'.replace(/x/g, (y) =>
      ((Math.random() * 16) | 0).toString(16)
    );

    const marker = new mapboxgl.Marker({
      draggable: true,
      color: color,
    })
      .setLngLat(this.center)
      .addTo(this.mapa);
    console.log(marker);

    this.marcadores.push({
      color,
      marker: marker,
    });
    this.guardarMarcadoresLocalStorage();
    marker.on('dragend', () => {
      this.guardarMarcadoresLocalStorage();
    });
  }

  guardarMarcadoresLocalStorage() {
    const lngLatArr: MarcadorColor[] = [];

    this.marcadores.forEach((m) => {
      const color = m.color;
      const { lng, lat } = m.marker!.getLngLat();
      lngLatArr.push({
        color: color,
        centro: [lng, lat],
      });
    });
    localStorage.setItem('marcadores', JSON.stringify(lngLatArr));
  }

  leerMarcadoresLocalStorae() {
    if (!localStorage.getItem('marcadores')) {
      return;
    }

    const lngLatArr: MarcadorColor[] = JSON.parse(
      localStorage.getItem('marcadores')!
    );
    lngLatArr.forEach((m) => {
      const newMarker = new mapboxgl.Marker({
        draggable: true,
        color: m.color,
      })
        .setLngLat(m.centro!)
        .addTo(this.mapa);
      this.marcadores.push({
        marker: newMarker,
        color: m.color,
      });
      newMarker.on('dragend', () => {
        this.guardarMarcadoresLocalStorage();
      });
    });
  }

  borrarMarcador(index: number) {
    this.marcadores[index].marker?.remove();
    this.marcadores.splice(1, 1);
    this.guardarMarcadoresLocalStorage();
  }
}
