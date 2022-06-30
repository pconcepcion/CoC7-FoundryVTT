import { CoCActor } from '../actors/actor.js'
import { _participant } from '../items/chase/participant.js'
import { CoC7Utilities } from '../utilities.js'

export class CoC7ChaseParticipantImporter extends FormApplication {
  static get defaultOptions () {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: 'systems/CoC7/templates/apps/chase-participant-importer.html',
      classes: ['coc7', 'dialog', 'chase-participant-importer'],
      editable: true,
      resizable: false,
      submitOnChange: true,
      closeOnSubmit: false,
      width: 300,
      height: 'auto'
    })
  }

  activateListeners (html) {
    super.activateListeners(html)

    const participantDragDrop = new DragDrop({
      dropSelector: '.form-container',
      permissions: { drop: game.user.isGM },
      callbacks: { drop: this._onDropParticipant.bind(this) }
    })
    participantDragDrop.bind(html[0])

    html.find('.reset-participant').click(async () => {
      delete this.object.docUuid
      await this.render(true)
    })
  }

  async getData () {
    if( !this.object.initiative){
      const init = CoCActor.getCharacteristicDefinition().find( c => c.key === "dex")
      this.object.initiative = `${game.i18n.localize('CoC7.Characteristics')} (${init.shortName})`
    }
    if( !this.object.speedCheck){
      const speedCheck = CoCActor.getCharacteristicDefinition().find( c => c.key === "con")
      this.object.speedCheck = {name: `${game.i18n.localize('CoC7.Characteristics')} (${speedCheck.shortName})`}
    }

    // const speedCheck = this.actor?.find( this.object.speedCheck?.name)
    // if( speedCheck){
    //   this.object.speedCheck = speedCheck
    // }


    const data = await super.getData()
    
    data.participant = new _participant(this.object)
    if( data.object.speedCheck.name && this.actor){
      const speedCheck = this.actor.find( data.object.speedCheck.name)
      if( speedCheck){
        data.object.speedCheck.score = speedCheck.value.value
        data.speedCheckReadOnly = true
      } else if( data.participant.speedCheck.score && !this.object.speedCheck?.score){
        data.object.speedCheck.score = data.participant.speedCheck.score
      }
    }

    if( data.object.initiative && this.actor){
      const initiative = this.actor.find( data.object.initiative)
      if( initiative){
        data.object.dex = initiative.value.value
        data.initReadOnly = true
      } else 
      data.object.dex = data.participant.initiative
    }

    data.actor = this.actor


    data.optionsList = {}
    if( this.chase)
    {
      data.optionsList.allSkillsAndCharacteristics = this.chase.allSkillsAndCharacteristics
    }

    if (this.actor) {
      data.optionsList.actorSkillsAndCharacteristics = []
      CoCActor.getCharacteristicDefinition().forEach(c =>
        data.optionsList.actorSkillsAndCharacteristics.push(
          `${game.i18n.localize('CoC7.Characteristics')} (${c.shortName})`
        )
      )
      data.optionsList.actorSkillsAndCharacteristics.push(
        `${game.i18n.localize('CoC7.Attribute')} (${game.i18n.localize(
          'CoC7.Luck'
        )})`
      )
      data.optionsList.actorSkillsAndCharacteristics.push(
        `${game.i18n.localize('CoC7.Attribute')} (${game.i18n.localize(
          'CoC7.SAN'
        )})`
      )
      this.actor.skills.forEach(s => data.optionsList.actorSkillsAndCharacteristics.push(s.fullName))
    }
    return data
  }

  get chase (){
    if( !this._chase) this._chase = CoC7Utilities.SfromUuid( this.object.chaseUuid)
    return this._chase
  }

  get actor (){
    if( !this.object.docUuid) return null
    if( !this._actor) this._actor = CoC7Utilities.getActorFromKey(this.object.docUuid)
    return this._actor
  }

  async _updateObject (event, formData) {
    foundry.utils.mergeObject(this, formData)
    await this.render(true)
  }

  async _onDropParticipant (event) {
    const target = event.currentTarget
    const form = target.closest('form')
    const dropString = event.dataTransfer.getData('text/plain')
    const dropData = JSON.parse(dropString)

    const docUuid = CoC7Utilities.getActorDocumentFromDropData(dropData)

    this.object.docUuid = docUuid
    await this.render(true)
  }

  static async create (data) {
    if (data.dropData) {
      const docUuid = CoC7Utilities.getActorDocumentFromDropData(data.dropData)
      if (docUuid) data.docUuid = docUuid
      delete data.dropData
    }
    return new CoC7ChaseParticipantImporter(data).render(true)
  }
}
