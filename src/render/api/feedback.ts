import type { ISubmitFeedbackReq, ISubmitFeedbackRes } from 'commonModule/type/ajax/feedback'
import { baseUrl } from 'commonModule/config'
import ajax from 'renderModule/utils/request/ajax'

/**
 * @description: 提交反馈
 */
export const submitFeedbackApi = (data: ISubmitFeedbackReq) => {
  return ajax<ISubmitFeedbackRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/platform/feedback/v1/submit_feedback`,
  })
}
