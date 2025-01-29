/* global foundry game TextEditor */
import { CoC7CharacterSheet } from './character.js'

export class CoC7CharacterSheetV3b extends CoC7CharacterSheet {
  static get defaultOptions () {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['coc7', 'sheetV3b', 'actor', 'character'],
      template: 'systems/CoC7/templates/actors/character-sheet-v3b.hbs',
      width: 980,
      height: 810,
      scrollY: ['.sheet-body']
    })
  }

  async getData () {
    const sheetData = await super.getData()
    const hp = this.actor.system.attribs.hp
    sheetData.imgSaturation = hp.value / hp.max

    sheetData.biographySections = []
    if (sheetData.data.system.biography instanceof Array && sheetData.data.system.biography.length) {
      for (const biography of sheetData.data.system.biography) {
        sheetData.biographySections.push({
          title: biography.title,
          value: biography.value,
          enriched: await TextEditor.enrichHTML(
            biography.value,
            {
              async: true,
              secrets: sheetData.editable
            }
          )
        })
      }
      sheetData.biographySections[0].isFirst = true
      sheetData.biographySections[sheetData.biographySections.length - 1].isLast = true
    }

    sheetData.showPartValues = !game.settings.get('CoC7', 'hidePartValues')

    return sheetData
  }

  activateListeners (html) {
    super.activateListeners(html)

    if (!this.object.sheet.isEditable) return

    html.find('.add-new-section-scroll').click(() => {
      this.actor.createBioSection()
      html.find('.sheet-body').each((i, el) => { el.scrollTop = el.scrollHeight - el.clientHeight })
      this.render()
    })
  }
}
