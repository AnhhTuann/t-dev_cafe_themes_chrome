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

function blendRgb(fg, bg, alpha) {
    return [
        Math.round(fg[0] * alpha + bg[0] * (1 - alpha)),
        Math.round(fg[1] * alpha + bg[1] * (1 - alpha)),
        Math.round(fg[2] * alpha + bg[2] * (1 - alpha))
    ];
}

function getLuminance(rgb) {
    return (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
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
    
    const editorBg = colors['editor.background'] || '#1e1e1e';
    const editorFg = colors['editor.foreground'] || '#cccccc';
    const accentHex = colors['editorCursor.foreground'] || colors['activityBar.foreground'] || '#007acc';

    const accentRgb = hexToRgb(accentHex);
    const editorBgRgb = hexToRgb(editorBg);
    const editorFgRgb = hexToRgb(editorFg);

    // If the accent is very bright, text on it should be dark
    const lum = getLuminance(accentRgb);
    const tabBackgroundTextRgb = lum > 0.5 ? [20, 20, 20] : [240, 240, 240];

    const chromeManifest = {
        manifest_version: 3,
        version: "1.0",
        name: theme.name + " Chrome Theme",
        description: `Chrome theme based on ${theme.name}`,
        theme: {
            colors: {
                frame: accentRgb,
                frame_inactive: blendRgb(accentRgb, [0, 0, 0], 0.8), // slightly darker when inactive
                toolbar: editorBgRgb,
                tab_text: editorFgRgb,
                tab_background_text: tabBackgroundTextRgb,
                bookmark_text: editorFgRgb,
                ntp_background: editorBgRgb,
                ntp_text: editorFgRgb
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
