#ifdef GL_ES
precision highp float;
#endif
varying vec2 vUV;
uniform vec3 u_borderColor;
uniform float u_borderThickness;
uniform sampler2D textureSampler;
uniform sampler2D depthTexture;

void main(void) {
	vec2 texelSize = u_borderThickness / vec2(textureSize(depthTexture, 0));

    vec3 sobel_x = texture2D(depthTexture, vUV + vec2(-texelSize.x, -texelSize.y)).rgb * -1.0 +
                   texture2D(depthTexture, vUV + vec2(texelSize.x, -texelSize.y)).rgb +
                   texture2D(depthTexture, vUV + vec2(-texelSize.x, 0.0)).rgb * -2.0 +
                   texture2D(depthTexture, vUV + vec2(texelSize.x, 0.0)).rgb * 2.0 +
                   texture2D(depthTexture, vUV + vec2(-texelSize.x, texelSize.y)).rgb * -1.0 +
                   texture2D(depthTexture, vUV + vec2(texelSize.x, texelSize.y)).rgb;

    vec3 sobel_y = texture2D(depthTexture, vUV + vec2(-texelSize.x, -texelSize.y)).rgb * -1.0 +
                   texture2D(depthTexture, vUV + vec2(texelSize.x, -texelSize.y)).rgb * -2.0 +
                   texture2D(depthTexture, vUV + vec2(-texelSize.x, 0.0)).rgb * -1.0 +
                   texture2D(depthTexture, vUV + vec2(texelSize.x, 0.0)).rgb +
                   texture2D(depthTexture, vUV + vec2(-texelSize.x, texelSize.y)).rgb * 2.0 +
                   texture2D(depthTexture, vUV + vec2(texelSize.x, texelSize.y)).rgb;

    vec3 sobel = sqrt(sobel_x * sobel_x + sobel_y * sobel_y) * 3.5;

    vec4 final = texture2D(textureSampler, vUV) + vec4(sobel.rrr, 1.0) * vec4(u_borderColor, 1.0);

    gl_FragColor = final;
}