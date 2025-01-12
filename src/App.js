import React, { useState, useRef } from "react";
import './App.css'
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import { Tile as TileLayer } from "ol/layer";
import { OSM } from "ol/source";
import { Draw, Modify } from "ol/interaction";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { fromLonLat } from "ol/proj";
import Modal from "react-modal";

Modal.setAppElement("#root");

const App = () => {
  const [map, setMap] = useState(null);
  const [drawType, setDrawType] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [coordinates, setCoordinates] = useState([]);
  const vectorSource = useRef(new VectorSource());
  const vectorLayer = useRef(
    new VectorLayer({
      source: vectorSource.current,
    })
  );

  const initializeMap = () => {
    const newMap = new Map({
      target: "map-container",
      layers: [
        new TileLayer({ source: new OSM() }),
        vectorLayer.current,
      ],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 2,
      }),
    });
    setMap(newMap);
  };

  React.useEffect(() => {
    initializeMap();
  }, []);

  const addDrawInteraction = (type) => {
    if (!map) return;

    const draw = new Draw({
      source: vectorSource.current,
      type,
    });

    draw.on("drawend", (event) => {
      const geom = event.feature.getGeometry();
      const coords = geom.getCoordinates();
      setCoordinates((prev) => [...prev, coords]);
      setShowModal(true);
      map.removeInteraction(draw);
    });

    map.addInteraction(draw);
  };

  const handleDrawLineString = () => {
    setDrawType("LineString");
    addDrawInteraction("LineString");
  };

  const handleDrawPolygon = () => {
    setDrawType("Polygon");
    addDrawInteraction("Polygon");
  };

  return (
    <div>
      <h1>Rekise Marine</h1>
      <div id="map-container" style={{ width: "100%", height: "600px" }}></div>

      <div style={{ margin: "10px" }}>
        <button onClick={handleDrawLineString}>Draw LineString</button>
        <button onClick={handleDrawPolygon}>Draw Polygon</button>
      </div>

      <Modal
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        contentLabel="Coordinates Modal"
      >
        <h2>{drawType} Coordinates</h2>
        <ul>
          {coordinates.map((coord, index) => (
            <li key={index}>
              WP({index + 1}): {coord.toString()}
            </li>
          ))}
        </ul>
        <button onClick={() => setShowModal(false)}>Close</button>
       
      </Modal>
    </div>
  );
};

export default App
