"use client";

import { ReservationStateEnum } from "@scspace-depot/enums/reservation.enum";
import { useMutationApi, useQueryApi } from "./api";
import {
  IReservation,
  IReservationAll,
  IReservationApplyWorker,
  IReservationApprovalRequest,
  IReservationCreate,
  IReservationCreateMultiple,
  IReservationMultipleCreateResurt,
  IReservationUpdate,
} from "@scspace-depot/types/reservation";
import { useEffect, useMemo, useState } from "react";
import {
  IDataResponse,
  ISuccessResponse,
} from "@scspace-depot/types/common/common.type";
import { dateUtils } from "./utils";

export interface IRes {
  id: number;
  name: string;
  title: string;
  hourFrom: number;
  hourTo: number;
  state: ReservationStateEnum;
}

export interface IReservationHookRes {
  [key: string]: IRes[];
}

function format({
  d,
  hF,
  hT,
}: {
  d: IReservationAll;
  hF: number;
  hT: number;
}): IRes {
  return {
    id: d.id,
    name: d.organizationId === 1 ? d.user.nameKr : d.organization.name,
    title: d.title,
    hourFrom: hF,
    hourTo: hT,
    state: d.state,
  };
}

export function useReservationAPI(
  param: {
    rid?: number;
    uid?: number;
    oid?: number;
    limit?: number;
    offset?: number;
    spaceId?: number;
    dateFrom?: Date;
    dateTo?: Date;
  } = {},
) {
  const rid = param.rid ?? 0;
  const uid = param.uid ?? 0;
  const oid = param.oid ?? 0;
  const limit = param.limit ?? 10;
  const offset = param.offset ?? 0;
  const spaceId = param.spaceId ?? 0;
  const dateFrom = useMemo(
    () => param.dateFrom ?? new Date(),
    [param.dateFrom],
  );
  const dateTo = useMemo(() => param.dateTo ?? new Date(), [param.dateTo]);
  const dateFromKey = dateFrom.getTime();
  const dateToKey = dateTo.getTime();

  const {
    getDateString,
    getTime,
    getMidnightTime,
    addDays,
    getDateUnit,
    timeUnit,
  } = dateUtils();
  const firstDay = getMidnightTime(getTime(dateFrom));
  const lastDay = getMidnightTime(getTime(dateTo));

  const allReservation = useQueryApi<IDataResponse<IReservationAll[]>>(
    `/reservation?oid=${oid}&limit=${limit}&offset=${offset}`,
  );

  const userReservation = useQueryApi<IDataResponse<IReservationAll[]>>(
    `/reservation/user?uid=${uid}&oid=${oid}&limit=${limit}&offset=${offset}`,
  );

  const _spaceReservation = useQueryApi<IReservationAll[]>(
    `/reservation/space?spaceId=${spaceId}&timeFrom=${getTime(dateFrom)}&timeTo=${getTime(dateTo)}`,
  );
  const spaceReservationData = _spaceReservation.data;

  const [dateReservation, setReservation] = useState<IReservationHookRes>({});
  useEffect(() => {
    if (!spaceReservationData) {
      setReservation({});
      return;
    }

    const _reservation: IReservationHookRes = {};
    for (let temp = firstDay; temp <= lastDay; temp = addDays(temp, 1)) {
      _reservation[getDateString(temp)] = [];
    }

    spaceReservationData.map(d => {
      const dF = getDateString(d.timeFrom);
      const dT = getDateString(d.timeTo);
      const tF = getDateUnit(d.timeFrom);
      const tT = getDateUnit(d.timeTo);

      if (dF === dT) {
        if (_reservation[dF])
          _reservation[dF].push(format({ d: d, hF: tF.hour, hT: tT.hour }));
      } else {
        if (d.timeFrom >= firstDay) {
          if (_reservation[dF])
            _reservation[dF].push(format({ d: d, hF: tF.hour, hT: 24 }));
        }
        if (d.timeTo <= lastDay + timeUnit.date - 1) {
          if (_reservation[dT])
            _reservation[dT].push(format({ d: d, hF: 0, hT: tT.hour }));
        }

        let _temp = addDays(getMidnightTime(d.timeFrom), 1);

        while (_temp < getMidnightTime(d.timeTo)) {
          const midKey = getDateString(_temp);
          if (_reservation[midKey])
            _reservation[midKey].push(format({ d, hF: 0, hT: 24 }));
          _temp = addDays(_temp, 1);
        }
      }
    });

    setReservation(_reservation);
  }, [
    spaceReservationData,
    dateFromKey,
    dateToKey,
    addDays,
    getDateString,
    getDateUnit,
    getMidnightTime,
    getTime,
    timeUnit.date,
    firstDay,
    lastDay,
  ]);
  const spaceReservation = {
    ..._spaceReservation,
    dataForCalendar: dateReservation,
  };

  const workHistory = useQueryApi<IReservationAll[]>(`/reservation/work`);

  const workNeeds = useQueryApi<IReservationAll[]>(`/reservation/work/needs`);

  const createRes = useMutationApi<IReservation, IReservationCreate>(
    "/reservation/",
    "POST",
  ).mutateAsync;

  const createMultipleRes = useMutationApi<
    IReservationMultipleCreateResurt,
    IReservationCreateMultiple
  >("/reservation/multiple", "POST").mutateAsync;

  const updateRes = useMutationApi<IReservation, IReservationUpdate>(
    `/reservation/`,
    "PUT",
  ).mutateAsync;

  const assignWorker = useMutationApi<IReservation, IReservationApplyWorker>(
    `/reservation/worker`,
    "PUT",
  ).mutateAsync;

  const deleteRes = useMutationApi<ISuccessResponse, {}>(
    `/reservation/${rid}`,
    "DELETE",
  ).mutateAsync;

  return {
    allReservation,
    userReservation,
    spaceReservation,
    workHistory,
    workNeeds,

    createRes,
    createMultipleRes,
    updateRes,
    assignWorker,
    deleteRes,
  };
}

export function useReservationApprovalAPI() {
  const pendingReservations = useQueryApi<IReservationAll[]>(
    "/reservation/manage",
  );

  const updateApproval = useMutationApi<
    IReservation,
    IReservationApprovalRequest
  >("/reservation/approval", "PATCH").mutateAsync;

  return {
    pendingReservations,
    updateApproval,
  };
}
