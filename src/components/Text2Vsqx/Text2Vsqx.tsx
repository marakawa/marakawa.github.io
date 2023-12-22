import { CSSProperties, MouseEventHandler, ReactNode, useState } from 'react'
import classNames from 'classnames'
import styles from './Text2Vsqx.module.scss'
import { saveAs } from 'file-saver'

const kanaPList = {
    // 2 letters
    きゃ: {
        ja: "k' a",
        en: '',
    },
    きゅ: {
        ja: "k' M",
        en: '',
    },
    きょ: {
        ja: "k' o",
        en: '',
    },
    ぎゃ: {
        ja: "g' a",
        en: '',
    },
    ぎゅ: {
        ja: "g' M",
        en: '',
    },
    ぎょ: {
        ja: "g' o",
        en: '',
    },
    しゃ: {
        ja: 'S a',
        en: '',
    },
    しゅ: {
        ja: 'S M',
        en: '',
    },
    しょ: {
        ja: 'S o',
        en: '',
    },
    じゃ: {
        ja: 'dZ a',
        en: '',
    },
    じゅ: {
        ja: 'dZ M',
        en: '',
    },
    じょ: {
        ja: 'dZ o',
        en: '',
    },
    にゃ: {
        ja: 'J a',
        en: '',
    },
    にゅ: {
        ja: 'J M',
        en: '',
    },
    にょ: {
        ja: 'J o',
        en: '',
    },
    ひゃ: {
        ja: 'C a',
        en: '',
    },
    ひゅ: {
        ja: 'C M',
        en: '',
    },
    ひょ: {
        ja: 'C o',
        en: '',
    },
    びゃ: {
        ja: "b' a",
        en: '',
    },
    びゅ: {
        ja: "b' M",
        en: '',
    },
    びょ: {
        ja: "b' o",
        en: '',
    },
    ふぁ: {
        ja: 'p\\ a',
        en: '',
    },
    ふぃ: {
        ja: "p\\' i",
        en: '',
    },
    ふぇ: {
        ja: 'p\\ e',
        en: '',
    },
    ふぉ: {
        ja: 'p\\ o',
        en: '',
    },
    みゃ: {
        ja: "m' a",
        en: '',
    },
    みゅ: {
        ja: "m' M",
        en: '',
    },
    みょ: {
        ja: "m' o",
        en: '',
    },
    りゃ: {
        ja: "4' a",
        en: '',
    },
    りゅ: {
        ja: "4' M",
        en: '',
    },
    りょ: {
        ja: "4' o",
        en: '',
    },
    // 1 letters
    あ: {
        ja: 'a',
        en: '',
    },
    い: {
        ja: 'i',
        en: '',
    },
    う: {
        ja: 'M',
        en: '',
    },
    え: {
        ja: 'e',
        en: '',
    },
    お: {
        ja: 'o',
        en: '',
    },
    か: {
        ja: 'k a',
        en: '',
    },
    き: {
        ja: "k' i",
        en: '',
    },
    く: {
        ja: 'k M',
        en: '',
    },
    け: {
        ja: 'k e',
        en: '',
    },
    こ: {
        ja: 'k o',
        en: '',
    },
    が: {
        ja: 'g a',
        en: '',
    },
    ぎ: {
        ja: "g' i",
        en: '',
    },
    ぐ: {
        ja: 'g M',
        en: '',
    },
    げ: {
        ja: 'g e',
        en: '',
    },
    ご: {
        ja: 'g o',
        en: '',
    },
    さ: {
        ja: 's a',
        en: '',
    },
    し: {
        ja: 'S i',
        en: '',
    },
    す: {
        ja: 's M',
        en: '',
    },
    せ: {
        ja: 's e',
        en: '',
    },
    そ: {
        ja: 's o',
        en: '',
    },
    ざ: {
        ja: 'dz a',
        en: '',
    },
    じ: {
        ja: 'dZ i',
        en: '',
    },
    ず: {
        ja: 'dz M',
        en: '',
    },
    ぜ: {
        ja: 'dz e',
        en: '',
    },
    ぞ: {
        ja: 'dz o',
        en: '',
    },
    た: {
        ja: 't a',
        en: '',
    },
    ち: {
        ja: 'tS i',
        en: '',
    },
    つ: {
        ja: 'ts M',
        en: '',
    },
    て: {
        ja: 't e',
        en: '',
    },
    と: {
        ja: 't o',
        en: '',
    },
    だ: {
        ja: 'd a',
        en: '',
    },
    ぢ: {
        ja: 'dZ i',
        en: '',
    },
    づ: {
        ja: 'dz M',
        en: '',
    },
    で: {
        ja: 'd e',
        en: '',
    },
    ど: {
        ja: 'd o',
        en: '',
    },
    な: {
        ja: 'n a',
        en: '',
    },
    に: {
        ja: 'J i',
        en: '',
    },
    ぬ: {
        ja: 'n M',
        en: '',
    },
    ね: {
        ja: 'n e',
        en: '',
    },
    の: {
        ja: 'n o',
        en: '',
    },
    は: {
        ja: 'h a',
        en: '',
    },
    ひ: {
        ja: 'C i',
        en: '',
    },
    ふ: {
        ja: 'p\\ M',
        en: '',
    },
    へ: {
        ja: 'h e',
        en: '',
    },
    ほ: {
        ja: 'h o',
        en: '',
    },
    ば: {
        ja: 'b a',
        en: '',
    },
    び: {
        ja: "b' i",
        en: '',
    },
    ぶ: {
        ja: 'b M',
        en: '',
    },
    べ: {
        ja: 'b e',
        en: '',
    },
    ぼ: {
        ja: 'b o',
        en: '',
    },
    ぱ: {
        ja: 'p a',
        en: '',
    },
    ぴ: {
        ja: "p' i",
        en: '',
    },
    ぷ: {
        ja: 'p M',
        en: '',
    },
    ぺ: {
        ja: 'p e',
        en: '',
    },
    ぽ: {
        ja: 'p o',
        en: '',
    },
    ま: {
        ja: 'm a',
        en: '',
    },
    み: {
        ja: "m' i",
        en: '',
    },
    む: {
        ja: 'm M',
        en: '',
    },
    め: {
        ja: 'm e',
        en: '',
    },
    も: {
        ja: 'm o',
        en: '',
    },
    や: {
        ja: 'j a',
        en: '',
    },
    ゆ: {
        ja: 'j M',
        en: '',
    },
    よ: {
        ja: 'j o',
        en: '',
    },
    ら: {
        ja: '4 a',
        en: '',
    },
    り: {
        ja: "4' i",
        en: '',
    },
    る: {
        ja: '4 M',
        en: '',
    },
    れ: {
        ja: '4 e',
        en: '',
    },
    ろ: {
        ja: '4 o',
        en: '',
    },
    わ: {
        ja: 'w a',
        en: '',
    },
    を: {
        ja: 'o',
        en: '',
    },
    ん: {
        ja: 'n',
        en: '',
    },
    っ: {
        ja: 'Sil',
        en: '',
    },
    ー: {
        ja: '-',
        en: '',
    },
}

const vsqxTemplate = /* xml */ `
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<vsq4 xmlns="http://www.yamaha.co.jp/vocaloid/schema/vsq4/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.yamaha.co.jp/vocaloid/schema/vsq4/ vsq4.xsd">
    <vender><![CDATA[Yamaha corporation]]></vender>
    <version><![CDATA[3.0.0.11]]></version>
    <vVoiceTable>
        <vVoice>
            <bs>0</bs>
            <pc>1</pc>
            <id><![CDATA[BLRGDDR4M3WM2LC6]]></id>
            <name><![CDATA[IA]]></name>
            <vPrm>
                <bre>0</bre>
                <bri>0</bri>
                <cle>0</cle>
                <gen>0</gen>
                <ope>0</ope>
            </vPrm>
            <id2><![CDATA[BLRGDDR4M3WM2LC6]]></id2>
            <vPrm2>
                <bre>0</bre>
                <bri>0</bri>
                <cle>0</cle>
                <gen>0</gen>
                <ope>0</ope>
                <vol>0</vol>
            </vPrm2>
        </vVoice>
    </vVoiceTable>
    <mixer>
        <masterUnit>
            <oDev>0</oDev>
            <rLvl>0</rLvl>
            <vol>0</vol>
        </masterUnit>
        <vsUnit>
            <tNo>0</tNo>
            <iGin>0</iGin>
            <sLvl>-898</sLvl>
            <sEnable>0</sEnable>
            <m>0</m>
            <s>0</s>
            <pan>64</pan>
            <vol>0</vol>
        </vsUnit>
        <monoUnit>
            <iGin>0</iGin>
            <sLvl>-898</sLvl>
            <sEnable>0</sEnable>
            <m>0</m>
            <s>0</s>
            <pan>64</pan>
            <vol>0</vol>
        </monoUnit>
        <stUnit>
            <iGin>0</iGin>
            <m>0</m>
            <s>0</s>
            <vol>-129</vol>
        </stUnit>
    </mixer>
    <masterTrack>
        <seqName><![CDATA[none]]></seqName>
        <comment><![CDATA[none]]></comment>
        <resolution>480</resolution>
        <preMeasure>4</preMeasure>
        <timeSig>
            <m>0</m>
            <nu>4</nu>
            <de>4</de>
        </timeSig>
        <timeSig>
            <m>4</m>
            <nu>4</nu>
            <de>4</de>
        </timeSig>
        <tempo>
            <t>0</t>
            <v>12000</v>
        </tempo>
        <tempo>
            <t>7680</t>
            <v>12000</v>
        </tempo>
    </masterTrack>
    <vsTrack>
        <tNo>0</tNo>
        <name><![CDATA[IA]]></name>
        <comment><![CDATA[Track]]></comment>
        <vsPart>
            <t>7680</t>
            <playTime>%PLAY_TIME%</playTime>
            <name><![CDATA[IA]]></name>
            <comment><![CDATA[]]></comment>
            <sPlug>
                <id><![CDATA[ACA9C502-A04B-42b5-B2EB-5CEA36D16FCE]]></id>
                <name><![CDATA[VOCALOID2 Compatible Style]]></name>
                <version><![CDATA[3.0.0.1]]></version>
            </sPlug>
            <pStyle>
                <v id="accent">50</v>
                <v id="bendDep">8</v>
                <v id="bendLen">0</v>
                <v id="decay">50</v>
                <v id="fallPort">0</v>
                <v id="opening">127</v>
                <v id="risePort">0</v>
            </pStyle>
            <singer>
                <t>0</t>
                <bs>0</bs>
                <pc>1</pc>
            </singer>
            <cc>
                <t>0</t>
                <v id="S">1</v>
            </cc>
            %NOTES%
            <plane>0</plane>
        </vsPart>
    </vsTrack>
    <monoTrack>
    </monoTrack>
    <stTrack>
    </stTrack>
    <aux>
        <id><![CDATA[AUX_VST_HOST_CHUNK_INFO]]></id>
        <content><![CDATA[VlNDSwAAAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=]]></content>
    </aux>
</vsq4>
`

const enableHalf = false

const exportVSQX = (lyrics: string) => {
    const kanaLines: string[] = []
    const lines = lyrics.trim().split('\n')
    lines.forEach((line) => {
        line = line.trim()
        if (line.match(/^[　 ー\u3040-\u309F]+$/)) {
            kanaLines.push(line)
        }
    })
    console.log(kanaLines)
    let notesStr = ''
    const noteLen = enableHalf ? 120 : 240
    const sectionLen = 3840
    const startBlank = sectionLen * 1
    const kanaRegex = new RegExp(Object.keys(kanaPList).join('|'), 'g')
    let playTime = 0
    kanaLines.forEach((line, lineIndex) => {
        const kanas = (line.match(kanaRegex) || []).reverse()
        kanas.forEach((kana, kanaIndex) => {
            const t = startBlank + sectionLen * (lineIndex + 1) - noteLen * (kanaIndex + 1)
            notesStr += `
                <note>
                    <t>${t}</t>
                    <dur>${noteLen}</dur>
                    <n>60</n>
                    <v>64</v>
                    <y><![CDATA[${kana}]]></y>
                    <p><![CDATA[${kanaPList[kana] ? kanaPList[kana].ja : 'a'}]]></p>
                    <nStyle>
                        <v id="accent">50</v>
                        <v id="bendDep">8</v>
                        <v id="bendLen">0</v>
                        <v id="decay">50</v>
                        <v id="fallPort">0</v>
                        <v id="opening">127</v>
                        <v id="risePort">0</v>
                        <v id="vibLen">0</v>
                        <v id="vibType">0</v>
                    </nStyle>
                </note>
            `
            playTime = Math.max(playTime, t + noteLen)
        })
    })
    const vsqx = vsqxTemplate
        .replace(/%NOTES%/g, notesStr)
        .replace(/%PLAY_TIME%/g, `${playTime}`)
        .trim()
    saveAs(new Blob([vsqx], { type: 'application/xml;charset=utf-8' }), 'download.vsqx')
}

interface Props {
    children?: ReactNode
    className?: string
    style?: CSSProperties
    onClick?: MouseEventHandler<HTMLDivElement>
}

function Text2Vsqx({ children, className, style, onClick }: Props): JSX.Element {
    const [lyrics, setLyrics] = useState<string>('')

    // Render
    return (
        <div className={classNames(styles.Text2Vsqx, className)} style={style} onClick={(e) => onClick && (e.target as HTMLElement).classList.contains(styles.Text2Vsqx) && onClick(e)}>
            <textarea cols={30} rows={10} onChange={(e) => setLyrics(e.target.value)} value={lyrics}></textarea>
            <button onClick={() => exportVSQX(lyrics)}>Export</button>
            {children}
        </div>
    )
}

export default Text2Vsqx
