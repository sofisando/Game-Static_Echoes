import { Scene } from "phaser";
import { MapConfig } from "../types/map";
import { hasFlag } from "../data/bucleState";
import { ObjetoDinamico } from "../types/dynamicObject";
import { getSortY } from "./depthSort";

export function preloadMap(scene: Phaser.Scene, config: MapConfig) {
  scene.load.tilemapTiledJSON(config.key, config.json);

  config.tilesets.forEach((tile) => {
    scene.load.image(tile.key, tile.image);
  });
}

export function createMap(scene: Phaser.Scene, config: MapConfig) {
  return scene.make.tilemap({
    key: config.key,
  });
}

export function addTilesets(map: Phaser.Tilemaps.Tilemap, config: MapConfig) {
  const resultado = new Map<string, Phaser.Tilemaps.Tileset>();

  config.tilesets.forEach((tile) => {
    const ts = map.addTilesetImage(tile.tiledName, tile.key);

    if (ts) {
      resultado.set(tile.key, ts);
    }
  });

  return resultado;
}

// ======================================================
// CAPAS DE TILED
// ======================================================

export function createLayers(
  map: Phaser.Tilemaps.Tilemap,
  tilesets: Map<string, Phaser.Tilemaps.Tileset>,
  config: MapConfig,
) {
  const tileLayers = new Map<string, Phaser.GameObjects.GameObject>();

  config.layers.forEach((layer) => {
    const layerTilesets = layer.tilesets
      .map((nombre) => tilesets.get(nombre))
      .filter(
        (tileset): tileset is Phaser.Tilemaps.Tileset => tileset !== undefined,
      );

    const tileLayer = map.createLayer(layer.name, layerTilesets);

    if (!tileLayer) {
      console.warn(`No se pudo crear la capa "${layer.name}"`);
      return;
    }

    /*
     * No usamos setDepth().
     *
     * Las Tile Layers se crean en el orden indicado
     * por config.layers.
     */
    tileLayers.set(layer.name, tileLayer);
  });

  return tileLayers;
}

// ======================================================
// PROPIEDADES DE OBJETOS DE TILED
// ======================================================

function getObjectProperty(
  obj: Phaser.Types.Tilemaps.TiledObject,
  name: string,
): unknown {
  return obj.properties?.find(
    (p: { name: string; value: unknown }) => p.name === name,
  )?.value;
}

// ======================================================
// COLOCAR UN LAYER EN EL MISMO ORDEN DE TILED
// ======================================================

function placeObjectLayerInTiledOrder(
  scene: Phaser.Scene,
  map: Phaser.Tilemaps.Tilemap,
  objectLayerName: string,
  objectLayer: Phaser.GameObjects.Layer,
  tileLayers: Map<string, Phaser.GameObjects.GameObject>,
): void {
  /*
   * Buscamos la posición real de la Object Layer
   * dentro de las capas exportadas por Tiled.
   */
  const objectLayerIndex = map.layers.findIndex(
    (layer) => layer.name === objectLayerName,
  );

  if (objectLayerIndex === -1) {
    console.warn(`No se encontró "${objectLayerName}" dentro de map.layers.`);
    return;
  }

  /*
   * Buscamos la capa de tiles anterior más cercana.
   *
   * Por ejemplo:
   *
   * Piso
   * Pared
   * Decoraciones
   * Mueble
   * Porcelana
   * Muebles       <- Object Layer
   *
   * Encontramos "Porcelana" y colocamos Muebles arriba.
   */
  for (let i = objectLayerIndex - 1; i >= 0; i--) {
    const nombre = map.layers[i].name;

    const tileLayer = tileLayers.get(nombre);

    if (tileLayer) {
      scene.children.moveAbove(
        objectLayer as unknown as Phaser.GameObjects.GameObject,
        tileLayer,
      );
      return;
    }
  }

  /*
   * Si no existe ninguna capa de tiles antes,
   * buscamos la siguiente.
   */
  for (let i = objectLayerIndex + 1; i < map.layers.length; i++) {
    const nombre = map.layers[i].name;

    const tileLayer = tileLayers.get(nombre);

    if (tileLayer) {
      scene.children.moveBelow(
        objectLayer as unknown as Phaser.GameObjects.GameObject,
        tileLayer,
      );
      return;
    }
  }

  console.warn(
    `No se encontró una capa visual de referencia para "${objectLayerName}".`,
  );
}

// ======================================================
// OBJETOS GRÁFICOS DE TILED
// ======================================================

export function createMapObjects(
  scene: Phaser.Scene,
  map: Phaser.Tilemaps.Tilemap,
  config: MapConfig,
  objectLayerName: string,
  tileLayers: Map<string, Phaser.GameObjects.GameObject>,
) {
  const layer = map.getObjectLayer(objectLayerName);

  if (!layer) {
    console.warn(`No existe la capa de objetos: ${objectLayerName}`);

    return {
      sprites: [] as Phaser.GameObjects.Sprite[],
      dinamicos: [] as ObjetoDinamico[],
      displayLayer: null as Phaser.GameObjects.Layer | null,
    };
  }

  /*
   * Este Layer representa la posición de la Object Layer
   * dentro del escenario.
   *
   * Los sprites se van a ordenar DENTRO de él.
   */
  const displayLayer = scene.add.layer();
  displayLayer.setName(objectLayerName);

  /*
   * Lo colocamos en el mismo lugar que ocupa esa capa
   * en Tiled respecto de las Tile Layers.
   */
  placeObjectLayerInTiledOrder(
    scene,
    map,
    objectLayerName,
    displayLayer,
    tileLayers,
  );

  const sprites: Phaser.GameObjects.Sprite[] = [];
  const dinamicos: ObjetoDinamico[] = [];

  layer.objects.forEach((obj) => {
    if (!obj.gid) {
      return;
    }

    // ==================================================
    // PROPIEDADES DINÁMICAS
    // ==================================================

    const dynamicId = getObjectProperty(obj, "dynamicId");
    const stateFlag = getObjectProperty(obj, "stateFlag");
    const falseGidRaw = getObjectProperty(obj, "falseGid");
    const trueGidRaw = getObjectProperty(obj, "trueGid");

    const falseGid =
      typeof falseGidRaw === "string" ? Number(falseGidRaw) : falseGidRaw;

    const trueGid =
      typeof trueGidRaw === "string" ? Number(trueGidRaw) : trueGidRaw;

    let gid = obj.gid;

    const esDinamico =
      typeof dynamicId === "string" &&
      typeof stateFlag === "string" &&
      typeof falseGid === "number" &&
      typeof trueGid === "number";

    if (esDinamico) {
      console.log("ESTADO AL CREAR:", stateFlag, hasFlag(stateFlag));

      gid = hasFlag(stateFlag) ? trueGid : falseGid;
    }

    // ==================================================
    // BUSCAR TILESET
    // ==================================================

    let tilesetEncontrado: Phaser.Tilemaps.Tileset | undefined;

    let tilesetConfig:
      | {
          tiledName: string;
          key: string;
          image: string;
        }
      | undefined;

    for (let i = 0; i < map.tilesets.length; i++) {
      const ts = map.tilesets[i];

      if (gid >= ts.firstgid && gid < ts.firstgid + ts.total) {
        tilesetEncontrado = ts;

        tilesetConfig = config.tilesets.find((t) => t.tiledName === ts.name);

        break;
      }
    }

    if (!tilesetEncontrado || !tilesetConfig) {
      console.warn(
        `No se encontró tileset para GID ${gid} en objeto "${obj.name}"`,
      );

      return;
    }

    const tileId = gid - tilesetEncontrado.firstgid;

    const tileWidth = tilesetEncontrado.tileWidth;

    const tileHeight = tilesetEncontrado.tileHeight;

    const columns = tilesetEncontrado.columns;

    if (!columns || !tileWidth || !tileHeight) {
      console.warn(
        `El tileset "${tilesetEncontrado.name}" no tiene información suficiente.`,
      );

      return;
    }

    const column = tileId % columns;

    const row = Math.floor(tileId / columns);

    const margin = tilesetEncontrado.tileMargin;

    const spacing = tilesetEncontrado.tileSpacing;

    const x = margin + column * (tileWidth + spacing);

    const y = margin + row * (tileHeight + spacing);

    const textureKey = tilesetConfig.key;

    const texture = scene.textures.get(textureKey);

    if (!texture) {
      console.warn(
        `No se encontró la textura "${textureKey}" para "${obj.name}"`,
      );

      return;
    }

    // ==================================================
    // FRAME
    // ==================================================

    const frameName = `obj-${objectLayerName}-${obj.id}-${gid}`;

    if (!texture.has(frameName)) {
      texture.add(frameName, 0, x, y, tileWidth, tileHeight);
    }

    // ==================================================
    // SPRITE
    // ==================================================

    const sprite = scene.add.sprite(
      obj.x! + tileWidth / 2,
      obj.y! - tileHeight / 2,
      textureKey,
      frameName,
    );

    sprite.setName(obj.name || "");

    /*
     * SORT-Y
     *
     * obj.y representa la base del objeto en Tiled.
     * Como el sprite tiene el origen por defecto en 0.5,
     * esta posición coincide con la parte inferior del tile.
     */
    sprite.setDepth(getSortY(sprite));

    if (obj.rotation) {
      sprite.setRotation(Phaser.Math.DegToRad(obj.rotation));
    }

    /*
     * AHORA EL SPRITE DEJA DE PERTENECER DIRECTAMENTE
     * AL DISPLAY LIST DE LA ESCENA Y PASA AL LAYER.
     */
    displayLayer.add(sprite);

    sprites.push(sprite);

    // ==================================================
    // REGISTRAR DINÁMICO
    // ==================================================

    if (esDinamico) {
      dinamicos.push({
        sprite,
        dynamicId,
        stateFlag,
        falseGid,
        trueGid,
      });
    }
  });

  return {
    sprites,
    dinamicos,
    displayLayer,
  };
}

// ======================================================
// COLISIONES
// ======================================================

export function createCollisionGroup(
  scene: Scene,
  map: Phaser.Tilemaps.Tilemap,
) {
  const grupo = scene.physics.add.staticGroup();

  const layer = map.getObjectLayer("Colisiones");

  if (!layer) return grupo;

  layer.objects.forEach((obj) => {
    const rect = scene.add.rectangle(
      obj.x! + obj.width! / 2,
      obj.y! + obj.height! / 2,
      obj.width!,
      obj.height!,
      0xff0000,
      0,
    );

    scene.physics.add.existing(rect, true);

    grupo.add(rect);
  });

  return grupo;
}
