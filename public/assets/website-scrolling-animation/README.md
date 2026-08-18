# TwinForge scrolling animation frames

Place the supplied PNG frames in this folder and add a `frames.json` file alongside them.

```json
{
  "frames": [
    "frame-001.png",
    "frame-002.png",
    "frame-003.png"
  ]
}
```

The homepage reads this manifest automatically and maps scroll progress across the listed frame order. Keep the frame list in chronological order and use web-optimized PNG files for smooth loading.
