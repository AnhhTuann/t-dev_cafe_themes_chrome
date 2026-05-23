const fs = require('fs');
const path = require('path');

const srcDir = 'D:\\A.T-Espresso\\themes';
const destDir = 'D:\\t-dev_cafe_themes_chrome';

function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    } else if (hex.length === 8) {
        hex = hex.substring(0, 6); // Ignore alpha channel for now
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return [r, g, b];
}

const themeFiles = [
    'cold-brew-theme.json',
    'espresso-night-theme.json',
    'golden-honey-theme.json',
    'matcha-espresso-theme.json',
    'mocha-macchiato-theme.json',
    'red-velvet-theme.json'
];

themeFiles.forEach(file => {
    const filePath = path.join(srcDir, file);
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const theme = JSON.parse(content);
    
    const colors = theme.colors || {};
    
    const activityBarBg = colors['activityBar.background'] || '#000000';
    const editorBg = colors['editor.background'] || '#ffffff';
    const editorFg = colors['editor.foreground'] || '#000000';

    // Helper to blend two RGB arrays
    function blendRgb(fg, bg, alpha) {
        return [
            Math.round(fg[0] * alpha + bg[0] * (1 - alpha)),
            Math.round(fg[1] * alpha + bg[1] * (1 - alpha)),
            Math.round(fg[2] * alpha + bg[2] * (1 - alpha))
        ];
    }
    
    const fgRgb = hexToRgb(editorFg);
    const bgRgb = hexToRgb(activityBarBg);
    // Make inactive tab text 60% of the foreground brightness to remain visible
    const fgMutedRgb = blendRgb(fgRgb, bgRgb, 0.6);

    const chromeManifest = {
        manifest_version: 3,
        version: "1.0",
        name: theme.name + " Chrome Theme",
        description: `Chrome theme based on ${theme.name}`,
        theme: {
            colors: {
                frame: hexToRgb(activityBarBg),
                frame_inactive: hexToRgb(activityBarBg),
                toolbar: hexToRgb(editorBg),
                tab_text: hexToRgb(editorFg),
                tab_background_text: fgMutedRgb,
                bookmark_text: hexToRgb(editorFg),
                ntp_background: hexToRgb(editorBg),
                ntp_text: hexToRgb(editorFg)
            }
        }
    };

    const folderName = file.replace('.json', '-chrome');
    const outFolderPath = path.join(destDir, folderName);
    
    if (!fs.existsSync(outFolderPath)) {
        fs.mkdirSync(outFolderPath, { recursive: true });
    }

    fs.writeFileSync(path.join(outFolderPath, 'manifest.json'), JSON.stringify(chromeManifest, null, 2));
    console.log(`Created theme in ${folderName}`);
});
