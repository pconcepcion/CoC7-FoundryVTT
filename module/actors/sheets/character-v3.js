/* global foundry */
import { CoC7CharacterSheet } from './character.js'

export class CoC7CharacterSheetV3 extends CoC7CharacterSheet {
  static get defaultOptions () {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['coc7', 'sheetV3', 'actor', 'character'],
      template: 'systems/CoC7/templates/actors/character-sheet-v3.hbs',
      width: 980,
      height: 810
    })
  }

  async getData () {
    const sheetData = await super.getData()
    const hp = this.actor.system.attribs.hp
    sheetData.imgSaturation = hp.value / hp.max
    return sheetData
  }
}
