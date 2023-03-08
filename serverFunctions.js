import { SecretManagerServiceClient } from "@google-cloud/secret-manager"
const client = new SecretManagerServiceClient()
import fetch from "node-fetch"

//Functional

export async function setEnvironmentVariable(identifier) {
  const name = `projects/de-wind-nu/secrets/${identifier}/versions/latest`
  const promiseVersion = client.accessSecretVersion({ name: name })

  const [version] = await promiseVersion
  const payload = version.payload.data.toString()

  process.env[identifier] = payload

  return promiseVersion
}

//Homepage

export async function getClientIPLocation(request, response) {
  let clientIP = request.ip
  if (port == 3000) clientIP = process.env.DEVELOPMENT_PUBLIC_IP_SERVER

  const IPQualityScore = await fetch(`https://ipqualityscore.com/api/json/ip/${process.env.IPQUALITYSCORE_KEY}/${clientIP}?strictness=0&allow_public_access_points=true&fast=true&lighter_penalties=true&mobile=true`)
    .catch(error => {
      console.log(error)
      response.json({ "success": false })
      return
    })
    .then(responseIP => { return responseIP.json() })

  if (IPQualityScore.fraud_score == 0) response.json({ "success": true, "lowEnoughIPScore": true, "lat": IPQualityScore.latitude, "lon": IPQualityScore.longitude })
  else response.json({ "success": true, "lowEnoughIPScore": false })
}

//Windpage

export function validID(checkID, locations, response) {

  if (checkID !== "" && checkID.length == 4 && /^\d+$/.test(checkID) == true) {
    if (!locations[checkID]) {
      response.json({ errorCode: 400 })
      return false
    }
  } else {
    response.json({ errorCode: 400 })
    return false
  }
  return true

}