# Shub Getting Started Template For Babylon Project

## Setup
Download [Node.js](https://nodejs.org/en/download/).
Run this followed commands:

``` bash
# Install dependencies (only the first time)
npm install

# Run the local server at localhost:port_id
npm run dev

# Build for production in the dist/ directory
npm run build
```
## Thought Process Behind This Assignment
1. In ths assignment, To draw outline I have used depthTexture to find edges, The edges are computed using Sobel's Edge Detection Method

2. After computing the edges I've merged edges drawn texture onto original scene texture to show outline on hovered mesh

[Implementation Done to know more about babylonjs](./static/ss1.png)

I previously have implemented God Rays Effects using only WebGL, The process of generating passes is similar to the outline the only difference is we need to compute the outline using depth texture. Here is the link to god rays using post-processing

    GitHub: https://github.com/shub1233/God-Rays
    Live: https://shub1233.github.io/God-Rays/




