"strict mode"

export default class Persistence{
  constructor(){
    this.username = window.location.href.replace(/^.*\/([^/?]+)\/?\??.*$/g, '$1')
    this.imagelist = fetch(`/usuario/${this.username}/imagelist`).then(response => response.json())
    this.notes = fetch(`/nota/${this.username}/obter`).then(response => response.json())
  }

  executeAfterFetch(callback){
    Promise.all([this.imagelist, this.notes]).then(callback)
  }

  getImages(){
    return this.imagelist;
  }

  addImage(url){
    const formData = new FormData();
    formData.append('image', url);
    return fetch(`/usuario/${this.username}/adicionarImagem/`,
    {
        method: "POST",
        body: formData
    })
  }

  removeImage(codigo){
    fetch(`/usuario/${this.username}/imagem/${codigo}`,{method: "DELETE"});
    console.log(`/usuario/${this.username}/imagem/${codigo}`)
  }

  fetchText(url, textFunc){
    if(localStorage[url] != undefined){
      textFunc(localStorage[url]);
    } else {
      fetch(url)
      .then((response) => {return response.text();})
      .then((text) => textFunc(text));
    }
  }

  getNotes(){
    return this.notes
  }

  updateNota(note){
    const url = note.dataset.url;
    const text = note.firstElementChild.value;

    let payload = {
      codigo: url,
      usuario: this.username,
      text: text
    };

    let upNota = fetch("/nota/updateNota", {
      method: "POST",
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(res=>res.json())
    return upNota
  }

  removeNota(codigo){
    fetch(`/usuario/${this.username}/nota/${codigo}`,{method: "DELETE"});
    console.log(`/usuario/${this.username}/nota/${codigo}`)
  }
}
