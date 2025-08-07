import { SchedulerItem } from '../src/stores/schedule'

const MAX_DAYS_PER_REQUEST = 30

// OpenAI API types
interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ScheduleResponse {
  add: ScheduleItem[]
  update: ScheduleItem[]
  delete: Omit<ScheduleItem, 'startTime' | 'endTime'>[]
}

interface ScheduleItem {
  startTime: string
  endTime: string
}

interface RequestBody {
  message: string
  currentSchedule: { id: string; startTime: string; endTime: string }[]
  timezone: string
}

interface ApiRequest {
  method: string
  body: RequestBody
}

interface ApiResponse {
  status: (code: number) => { json: (data: ScheduleResponse | { error: string }) => void }
}

const chatCompletion = async (systemPrompt: string, messages: ChatMessage[]) => {
  const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1',
      messages: messages,
      temperature: 0.2,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    }),
  })

  const data = await openaiRes.json()
  const reply = data.choices?.[0]?.message?.content?.trim()

  return reply
}

const getAffectedDays = async (
  message: string,
  timezone: string,
): Promise<{ dates: string[]; isUpdate: boolean }> => {
  const systemPrompt = `
  You are a scheduling assistant. The user will provide a message with changes to their weekly availability in natural language enclosed in #### (e.g., "Add M-F 9 AM - 5 PM with a break from 1 PM to 2 PM" or "Remove Wednesdays").

  Your task is to figure out which days are affected by the message.

  - Start with tomorrow (${new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]}) and continue for ${MAX_DAYS_PER_REQUEST} days.
  - If no specific days are mentioned, return all days (no more than ${MAX_DAYS_PER_REQUEST} days out).
  - Do not go past ${new Date(new Date().setDate(new Date().getDate() + MAX_DAYS_PER_REQUEST)).toISOString().split('T')[0]}
  - The user's IANA timezone is ${timezone}.
  - Double-check that the days of the week requested are correct.
  - Return a JSON object with a dates array of strings with the date in the format YYYY-MM-DD.
  - Dtermine if the use is asking for an update. If so return an isUpdate flag with the value true.

  Example:
  Message: "Add M-F 9 AM - 5 PM with a break from 1 PM to 2 PM"
  Return: {dates: ["2025-08-08", "2025-08-11", "2025-08-12", "2025-08-13", "2025-08-14", ...], isUpdate: false}

  Message: "Remove Wednesdays"
  Return: {dates: ["2025-08-06", "2025-08-13", "2025-08-20", "2025-08-27", "2025-09-03", ...], isUpdate: true}

  `

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `####${message}####` },
  ]
  const reply = await chatCompletion(systemPrompt, messages)
  return JSON.parse(reply)
}

const generateNewSchedule = async (
  message: string,
  timezone: string,
  day: string,
  schedule: { id: string; startTime: string; endTime: string }[],
): Promise<ScheduleResponse> => {
  const systemPrompt = `
  You are a scheduling assistant. The user will provide a message with changes to their weekly availability in natural language enclosed in #### (e.g., "Add M-F 9 AM - 5 PM with a break from 1 PM to 2 PM" or "Remove Wednesdays").

  Your task is to generate a new schedule based on the message and the current schedule.

  - The user's IANA timezone is ${timezone}.
  - The day is ${day}.
  - The current schedule is ${JSON.stringify(schedule, null, 2)}.
  - Return a JSON array of objects with the add/update/delete schedule.
  - If no changes are needed, return an empty array for each type.
  - If the user asks for a change look to see what scedules in intersects with. Update the schedule to match the new schedule. Add new items if needed. Delete items if needed.

  Format should be:
  {
    "add": [AddScheduleItem, ...],
    "update": [UpdateScheduleItem, ...],
    "delete": [DeleteScheduleItem, ...]
  }

  AddScheduleItem:
  {
    "startTime": "2025-08-07T09:00:00-04:00",
    "endTime": "2025-08-07T13:00:00-04:00"
  }

  UpdateScheduleItem:
  {
    "id": "123",
    "startTime": "2025-08-07T09:00:00-04:00",
    "endTime": "2025-08-07T13:00:00-04:00"
  }

  DeleteScheduleItem:
  {
    "id": "123"
  }
  `

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `####${message}####` },
  ]
  const reply = await chatCompletion(systemPrompt, messages)
  return JSON.parse(reply)
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
    })
  }

  const { message, currentSchedule, timezone } = req.body

  console.log('ai-scheduler', { message, currentSchedule, timezone })

  if (!message || !timezone) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const { dates, isUpdate } = await getAffectedDays(message, timezone)
  console.log('affectedDays', dates)

  const response: ScheduleResponse = {
    add: [],
    update: [],
    delete: [],
  }

  const promises = dates.map(async (day) => {
    const daysSchedule = currentSchedule.filter((item) => item.startTime?.split('T')[0] === day)
    // if the user is requesting an update and there no schedules to update, don't add/update/delete anything
    if (isUpdate && daysSchedule.length === 0) {
      console.log('no schedules to update', { day })
      return {
        add: [],
        update: [],
        delete: [],
      }
    }

    const newSchedule = await generateNewSchedule(message, timezone, day, daysSchedule)

    console.log('newSchedule', { newSchedule, day })
    if (newSchedule.add?.length > 0) {
      response.add.push(...newSchedule.add)
    }
    if (newSchedule.update?.length > 0) {
      response.update.push(...newSchedule.update)
    }
    if (newSchedule.delete?.length > 0) {
      response.delete.push(...newSchedule.delete)
    }
  })

  await Promise.all(promises)

  console.log('response', response)

  return res.status(200).json(response)
}
