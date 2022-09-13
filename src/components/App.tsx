import React from 'react';
import '../App.css';
import { initViewEngine, viewEngine } from '../engine';
import { initEventListeners } from '../events';
import { initializeSync } from '../network';
import { Menu } from './Menu';


initViewEngine();
initializeSync();
initEventListeners();

viewEngine.loader.add('background', 'background.gif');


viewEngine.loader.load((loader, resources) => {
    const image = resources.background.animation!;
    image.zIndex = 1;
    image.scale.set(1.75, 3);
    image.position.y -= 170;
    viewEngine.stage.addChild(image!);
});

viewEngine.stage.sortableChildren = true;


export const App = () => <Menu/>;
