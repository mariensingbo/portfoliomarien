precision highp float;

uniform float uAlpha;
uniform sampler2D tMap;

varying vec2 vUv;

vec3 linearTosRGB(vec3 color) {
    return pow(color, vec3(1.0 / 2.2));
}

void main() {
    vec4 texture = texture2D(tMap, vUv);
    texture.rgb = linearTosRGB(texture.rgb);

    gl_FragColor = texture;
    gl_FragColor.a = uAlpha;
}
