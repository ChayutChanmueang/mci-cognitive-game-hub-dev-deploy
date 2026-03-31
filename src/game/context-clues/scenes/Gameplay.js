import Phaser from "phaser";
import GameplayUI from "../entity/script/ui/gameplay-ui";
import RandomQuiz from "../components/scripts/random-quiz.js";
import {LevelMap} from "../constants.js";

export default class GameplayScene extends Phaser.Scene {
  constructor() {
    super("gameplay-scene");

    this.wordSegmenter = typeof Intl !== "undefined" && Intl.Segmenter
      ? new Intl.Segmenter("th", { granularity: "word" })
      : null;
    this.graphemeSegmenter = typeof Intl !== "undefined" && Intl.Segmenter
      ? new Intl.Segmenter("th", { granularity: "grapheme" })
      : null;
  }

  preload() {
    this.load.scenePlugin(
      "rexuiplugin",
      "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js",
      "rexUI",
      "rexUI",
    );

    this.load.image('button-idle','assets/button_rectangle_depth_flat.png')
    this.load.image('button-press','assets/button_rectangle_flat.png')
  }

  init(data) {
    this.level = data.level;
    this.levelMap = LevelMap[this.level];
  }

  create(data) {
    const quizData = RandomQuiz.getQuiz(this.levelMap);
    const title = RandomQuiz.buildQuiz(quizData.textParts);
    const titleWrapWidth = this.scale.width * 0.8;

    this.easyBtn = this.createButton(this.scale.width / 2, (this.scale.height / 2) - 100, "RETURN", () => {
      this.scene.start('main-menu-scene',{ conveyerNums: 1 })
    });
    this.titleText = this.add.text(this.scale.width / 2, this.scale.height / 2 - 250, title, {
      fontSize: '72px',
      fontStyle: 'bold',
      fontFamily: '"Noto Sans Thai", "Sarabun", "Prompt", "Kanit", "Leelawadee UI", sans-serif',
      align: 'center',
      wordWrap: {
        callback: (text, textObject) => this.wrapThaiText(text, textObject, titleWrapWidth)
      }
    }).setOrigin(0.5);
    this.titleText.setPadding({ left: 12, right: 12, top: 28, bottom: 20 });
    this.titleText.setLineSpacing(20);
    this.titleText.setDepth(100);

    this.gameplayUI = new GameplayUI(this, 0, 0);
  }

  wrapThaiText(text, textObject, maxWidth) {
    const lines = [];

    for (const rawLine of text.split(/\r?\n/)) {
      const segments = this.segmentWords(rawLine);

      if (!segments.length) {
        lines.push("");
        continue;
      }

      let currentLine = "";

      for (const segment of segments) {
        const nextSegment = currentLine ? segment : segment.trimStart();

        if (!nextSegment) {
          continue;
        }

        const candidateLine = currentLine + nextSegment;

        if (currentLine && textObject.context.measureText(candidateLine).width > maxWidth) {
          lines.push(currentLine.trimEnd());

          if (textObject.context.measureText(nextSegment).width > maxWidth) {
            const brokenSegments = this.breakLongSegment(nextSegment, textObject, maxWidth);

            lines.push(...brokenSegments.slice(0, -1));
            currentLine = brokenSegments[brokenSegments.length - 1] ?? "";
          } else {
            currentLine = nextSegment;
          }

          continue;
        }

        if (!currentLine && textObject.context.measureText(nextSegment).width > maxWidth) {
          const brokenSegments = this.breakLongSegment(nextSegment, textObject, maxWidth);

          lines.push(...brokenSegments.slice(0, -1));
          currentLine = brokenSegments[brokenSegments.length - 1] ?? "";
          continue;
        }

        currentLine = candidateLine;
      }

      if (currentLine) {
        lines.push(currentLine.trimEnd());
      }
    }

    return lines.length ? lines : [""];
  }

  segmentWords(text) {
    if (!text) {
      return [];
    }

    if (this.wordSegmenter) {
      return Array.from(this.wordSegmenter.segment(text), ({ segment }) => segment);
    }

    return text.split(/(\s+)/).filter(Boolean);
  }

  breakLongSegment(text, textObject, maxWidth) {
    const graphemes = this.graphemeSegmenter
      ? Array.from(this.graphemeSegmenter.segment(text), ({ segment }) => segment)
      : Array.from(text);
    const segments = [];
    let currentSegment = "";

    for (const grapheme of graphemes) {
      const candidateSegment = currentSegment + grapheme;

      if (currentSegment && textObject.context.measureText(candidateSegment).width > maxWidth) {
        segments.push(currentSegment);
        currentSegment = grapheme;
        continue;
      }

      currentSegment = candidateSegment;
    }

    if (currentSegment) {
      segments.push(currentSegment);
    }

    return segments;
  }

  createButton(x,y,text,onClick){
        const bg = this.add.rectangle(x,y,200,60,0x00aa00,1).setInteractive({useHandCursor: true});
        bg.setScale(1.5);
        const label = this.add.text(x,y,text,{
            fontSize: '28px', fontStyle: 'bold'
        }).setOrigin(0.5);
        label.setScale(1.5);

        bg.on('pointerdown',onClick);

        bg.on('pointerover', () => bg.setFillStyle(0x00ff00));
        bg.on('pointerout', () => bg.setFillStyle(0x00aa00));

        return [bg,label];
    }
}
