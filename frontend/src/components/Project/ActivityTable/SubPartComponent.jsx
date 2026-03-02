import React, { useEffect, useMemo, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
// InfoCard component for showing status reason, using portal for precise positioning
function StatusInfoCard({ reason, onClose, anchorRef, onMarkCompleted, onMarkPending, currentStatus }) {
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const cardRef = useRef(null)

  useEffect(() => {
    function updatePos() {
      if (anchorRef && anchorRef.current) {
        const rect = anchorRef.current.getBoundingClientRect()
        const cardWidth = cardRef.current ? cardRef.current.offsetWidth : 240
        const left = Math.min(
          rect.left + window.scrollX,
          window.innerWidth - cardWidth - 16
        )
        setPos({
          top: rect.bottom + window.scrollY + 8,
          left,
        })
      }
    }
    updatePos()
    window.addEventListener('scroll', updatePos, true)
    window.addEventListener('resize', updatePos)
    return () => {
      window.removeEventListener('scroll', updatePos, true)
      window.removeEventListener('resize', updatePos)
    }
  }, [anchorRef])

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  const card = (
    <div
      ref={cardRef}
      style={{ position: 'absolute', top: pos.top, left: pos.left, zIndex: 1000 }}
      className="bg-white border border-gray-300 rounded shadow-lg p-3 min-w-[220px] max-w-xs"
    >
      <div className="font-semibold text-gray-800 mb-1">Status Info</div>
      <div className="text-gray-700 text-sm whitespace-pre-line mb-2">{reason || 'No reason provided.'}</div>
      <div className="flex gap-2 mb-2">
        <button
          className={`px-3 py-1 rounded text-xs font-semibold ${currentStatus === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-green-200 hover:text-green-800'}`}
          onClick={onMarkCompleted}
        >
          Mark as Completed
        </button>
        <button
          className={`px-3 py-1 rounded text-xs font-semibold ${currentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700 hover:bg-yellow-200 hover:text-yellow-900'}`}
          onClick={onMarkPending}
        >
          Mark as Pending
        </button>
      </div>
      <button
        className="mt-1 px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  )
  return createPortal(card, document.body)
}
import { useDispatch, useSelector } from 'react-redux'
import { fetchActivities, fetchActivitiesBySubstageId, mapActivityToSubstage, unmapActivityFromSubstage } from '../../../features/activitiesSlice'
import TableComponent from '../../Table/TableComponent'

import { FaCheckCircle, FaRegCircle } from 'react-icons/fa'

import axios from 'axios'

export default function SubPartComponent({ tableMode = true, editMode = false }) {
  // For info card popup
  const [infoCard, setInfoCard] = useState({ key: null, reason: '', anchor: null, substageId: null, activityName: '', currentStatus: '' })

  // Update status handler
  const handleUpdateStatus = async (substageId, activityName, newStatus) => {
    try {
      // You may want to move this to a thunk for better state management
      await axios.put('http://localhost:3000/api/v1/activity/substage-activity-status', {
        substageId,
        activityName,
        status: newStatus,
      }, { withCredentials: true })
      // Refresh activities for this substage
      dispatch(fetchActivitiesBySubstageId(substageId))
      setInfoCard((prev) => ({ ...prev, currentStatus: newStatus }))
    } catch (err) {
      alert('Failed to update status')
    }
  }
  const dispatch = useDispatch()
  const activeSubStages = useSelector((s) => s.substages.activeSubStages) || []
  const activitiesBySubstage = useSelector((s) => s.activities.activitiesBySubstage) || {}
  const globalActivities = useSelector((s) => s.activities.activities) || []

  const [pending, setPending] = useState({}) // { "subId_actId": true }
  const [loadingMap, setLoadingMap] = useState({}) // { subId: true }
  const [search, setSearch] = useState('')
  const [showEmptyOnly, setShowEmptyOnly] = useState(false)
  const [selectedRowIds, setSelectedRowIds] = useState(new Set())
  const [selectedActivityKeys, setSelectedActivityKeys] = useState(new Set())
  const [showRowsDropdown, setShowRowsDropdown] = useState(false)
  const [showColsDropdown, setShowColsDropdown] = useState(false)
  const rowsRef = useRef(null)
  const colsRef = useRef(null)

  // fetch activities for each active substage, with per-substage loading indicators
  useEffect(() => {
    const fetchFor = async (id) => {
      try {
        setLoadingMap((p) => ({ ...p, [id]: true }))
        await dispatch(fetchActivitiesBySubstageId(id))
      } catch (e) {
        console.error('fetch activities failed for', id, e)
      } finally {
        setLoadingMap((p) => {
          const c = { ...p }
          delete c[id]
          return c
        })
      }
    }

    activeSubStages.forEach((sub) => {
      const id = sub.substageId ?? sub.subStageId
      if (!id) return
      if (!activitiesBySubstage[id] && !loadingMap[id]) {
        fetchFor(id)
      }
    })
  }, [activeSubStages, activitiesBySubstage, loadingMap, dispatch])

  // derive unique activity columns
  const masterActivities = useMemo(() => {
    const map = new Map()
    const ga = Array.isArray(globalActivities)
      ? globalActivities
      : globalActivities?.data && Array.isArray(globalActivities.data)
      ? globalActivities.data
      : []
    ga.forEach((a) => {
      const rawId = a.activityid ?? a.activityId ?? a.activity_name ?? a.activityName
      const display = (
        a.activity_name ?? a.activityName ?? (rawId === undefined || rawId === null ? '' : String(rawId))
      ).toString()
      const trimmed = display.trim()
      if (!trimmed) return
      const key = trimmed.toLowerCase()
      if (!map.has(key)) map.set(key, { id: key, name: trimmed })
    })
    return Array.from(map.values())
  }, [globalActivities])

  const filteredActivities = useMemo(() => {
    if (!search) return masterActivities
    const q = search.trim().toLowerCase()
    return masterActivities.filter(
      (a) =>
        (a.name || '').toLowerCase().includes(q) ||
        String(a.id).toLowerCase().includes(q)
    )
  }, [masterActivities, search])

  useEffect(() => {
    if (activeSubStages && activeSubStages.length > 0 && selectedRowIds.size === 0) {
      setSelectedRowIds(new Set(activeSubStages.map((s) => s.substageId ?? s.subStageId)))
    }
  }, [activeSubStages])

  useEffect(() => {
    if (masterActivities && masterActivities.length > 0 && selectedActivityKeys.size === 0) {
      setSelectedActivityKeys(new Set(masterActivities.map((a) => a.id)))
    }
    if (!globalActivities || globalActivities.length === 0) {
      dispatch(fetchActivities())
    }
  }, [masterActivities, globalActivities, selectedActivityKeys, dispatch])

  // close dropdowns when clicking outside
  useEffect(() => {
    const onDocClick = (e) => {
      if (rowsRef.current && !rowsRef.current.contains(e.target)) {
        setShowRowsDropdown(false)
      }
      if (colsRef.current && !colsRef.current.contains(e.target)) {
        setShowColsDropdown(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('touchstart', onDocClick)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('touchstart', onDocClick)
    }
  }, [])

  const visibleSubstages = useMemo(() => {
    if (!showEmptyOnly) return activeSubStages
    return activeSubStages.filter((sub) => {
      const subId = sub.substageId ?? sub.subStageId
      const acts = activitiesBySubstage[subId] || []
      const nonEmptyCount = (acts || []).reduce((c, a) => {
        const rawId = a.activityId ?? a.activityid ?? a.activity_name ?? a.activityName
        const display = (
          a.activityName ?? a.activity_name ?? (rawId === undefined || rawId === null ? '' : String(rawId))
        ).toString()
        return c + (display.trim() ? 1 : 0)
      }, 0)
      return nonEmptyCount === 0
    })
  }, [activeSubStages, activitiesBySubstage, showEmptyOnly])

  const isAnyLoading = Object.keys(loadingMap).length > 0

  // Friendly button labels for Rows and Columns (show selected names up to 2, else fallback)
  const rowsSelectedNames = (() => {
    const all = activeSubStages.map((s) => s.substageName ?? s.subStageName ?? s.substagename).filter(Boolean)
    const selected = selectedRowIds.size === 0 ? all : all.filter((_, idx) => selectedRowIds.has(activeSubStages[idx]?.substageId ?? activeSubStages[idx]?.subStageId))
    if (selected.length === 0) return `All substages (${all.length})`
    if (selected.length === 1) return `${selected[0]} (${selected.length})`
    if (selected.length === 2) return `${selected[0]}, ${selected[1]} (${selected.length})`
    return `${selected[0]}, ${selected[1]}... (${selected.length})`
  })()

  const colsSelectedNames = (() => {
    const all = masterActivities.map((a) => a.name)
    const selected = selectedActivityKeys.size === 0 ? all : all.filter((name) => selectedActivityKeys.has((name || '').toString().toLowerCase()))
    if (selected.length === 0) return `All activities (${all.length})`
    if (selected.length === 1) return `${selected[0]} (${selected.length})`
    if (selected.length === 2) return `${selected[0]}, ${selected[1]} (${selected.length})`
    return `${selected[0]}, ${selected[1]}... (${selected.length})`
  })()

  const Controls = (
    <div className="flex items-center justify-between gap-3 mb-3">
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activities or IDs..."
            className="pl-8 pr-3 py-2 border rounded bg-white text-sm w-64 focus:outline-none focus:ring-1 focus:ring-indigo-300"
          />
          <svg
            className="w-4 h-4 absolute left-2 top-2 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.387-1.414 1.414-4.387-4.387zM8 14a6 6 0 100-12 6 6 0 000 12z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <label className="inline-flex items-center text-sm text-gray-600">
          <input
            type="checkbox"
            className="mr-2"
            checked={showEmptyOnly}
            onChange={(e) => setShowEmptyOnly(e.target.checked)}
          />
          Show only substages without activities
        </label>

  {/* Rows dropdown */}
  <div className="relative" ref={rowsRef}>
          <button
            type="button"
            className="ml-2 px-3 py-2 border rounded-md text-sm bg-white text-[#0061A1] font-medium flex items-center gap-2 hover:bg-[#f8fcff]"
            onClick={() => setShowRowsDropdown((s) => !s)}
            aria-haspopup="true"
            aria-expanded={showRowsDropdown}
          >
            <span className="text-sm">Substage</span>
          </button>
          {showRowsDropdown && (
            <div className="absolute z-30 mt-2 w-64 bg-blue-50 border border-blue-100 rounded-md shadow-lg p-2 max-h-64 overflow-auto">
              {activeSubStages.map((sub) => {
                const id = sub.substageId ?? sub.subStageId
                const name = sub.substageName ?? sub.subStageName ?? sub.substagename
                const checked = selectedRowIds.size === 0 ? true : selectedRowIds.has(id)
                return (
                  <label key={id} className="flex items-center gap-3 text-base py-2 px-3 rounded hover:bg-blue-100 w-full cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-blue-600"
                      checked={checked}
                      onChange={(e) => {
                        setSelectedRowIds((prev) => {
                          const initial =
                            prev.size === 0
                              ? new Set(activeSubStages.map((s) => s.substageId ?? s.subStageId))
                              : new Set(prev)
                          if (e.target.checked) initial.add(id)
                          else initial.delete(id)
                          return initial
                        })
                      }}
                    />
                    <span className="text-blue-800">{name}</span>
                  </label>
                )
              })}
            </div>
          )}
        </div>

  {/* Columns dropdown */}
  <div className="relative" ref={colsRef}>
          <button
            type="button"
            className="ml-2 px-3 py-2 border rounded-md text-sm bg-white text-[#0061A1] font-medium flex items-center gap-2 hover:bg-[#f8fcff]"
            onClick={() => setShowColsDropdown((s) => !s)}
            aria-haspopup="true"
            aria-expanded={showColsDropdown}
          >
            <span className="text-sm">Activities</span>
          </button>
          {showColsDropdown && (
            <div className="absolute z-30 mt-2 w-64 bg-blue-50 border border-blue-100 rounded-md shadow-lg p-2 max-h-64 overflow-auto">
              {masterActivities.map((act) => {
                const checked = selectedActivityKeys.size === 0 ? true : selectedActivityKeys.has(act.id)
                return (
                  <label key={act.id} className="flex items-center gap-3 text-base py-2 px-3 rounded hover:bg-blue-100 w-full cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-blue-600"
                      checked={checked}
                      onChange={(e) => {
                        setSelectedActivityKeys((prev) => {
                          const initial =
                            prev.size === 0 ? new Set(masterActivities.map((x) => x.id)) : new Set(prev)
                          if (e.target.checked) initial.add(act.id)
                          else initial.delete(act.id)
                          return initial
                        })
                      }}
                    />
                    <span className="text-blue-800">{act.name}</span>
                  </label>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <div className="text-sm text-gray-500">
        {isAnyLoading ? 'Loading activities...' : `${visibleSubstages.length} substages`}
      </div>
    </div>
  )

  // if (!tableMode) {
  //   // Card / list view
  //   return (
  //     <div className="flex flex-col gap-4 h-full p-2">
  //       {Controls}
  //       <div className="flex-1 overflow-auto">
  //         {visibleSubstages.length === 0 ? (
  //           <div className="text-sm text-gray-500">No substages selected</div>
  //         ) : (
  //           visibleSubstages
  //             .filter((sub) =>
  //               selectedRowIds.size === 0 ? true : selectedRowIds.has(sub.substageId ?? sub.subStageId)
  //             )
  //             .map((sub) => {
  //               const subId = sub.substageId ?? sub.subStageId
  //               const acts = activitiesBySubstage[subId] || []
  //               const loading = !!loadingMap[subId]
  //               return (
  //                 <div
  //                   key={subId}
  //                   className="border rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition-shadow mb-3"
  //                 >
  //                   <div className="flex items-center justify-between mb-3">
  //                     <div>
  //                       <div className="font-semibold text-gray-800">
  //                         {sub.substageName ?? sub.subStageName ?? sub.substagename}
  //                       </div>
  //                       <div className="text-xs text-gray-500">{acts.length} activities</div>
  //                     </div>
  //                     <div className="text-sm text-gray-600">
  //                       Progress: {sub.progress ?? '0'}%
  //                     </div>
  //                   </div>

  //                   <div className="flex gap-4 overflow-x-auto py-1">
  //                     {loading ? (
  //                       <div className="text-sm text-gray-500 flex items-center gap-2">
  //                         <div className="w-4 h-4 rounded-full border-2 border-indigo-300 animate-spin" />{' '}
  //                         Loading
  //                       </div>
  //                     ) : acts.length === 0 ? (
  //                       <div className="text-sm text-gray-500">No activities for this substage.</div>
  //                     ) : (
  //                       acts
  //                         .filter((a) => {
  //                           if (!search) return true
  //                           const q = search.toLowerCase()
  //                           const name = (a.activityName ?? a.activity_name ?? '') + ''
  //                           return (
  //                             name.toLowerCase().includes(q) ||
  //                             String(
  //                               a.activityId ?? a.activityid ?? a.activity_name ?? a.activityName
  //                             )
  //                               .toLowerCase()
  //                               .includes(q)
  //                           )
  //                         })
  //                         .map((a) => (
  //                           <div
  //                             key={
  //                               a.activityId ??
  //                               a.activityid ??
  //                               a.activity_name ??
  //                               a.activityName
  //                             }
  //                             className="w-64 p-3 border rounded bg-gray-50 hover:bg-white transition-colors flex-shrink-0"
  //                           >
  //                             <div className="font-medium text-gray-800">
  //                               {a.activityName ?? a.activity_name}
  //                             </div>
  //                           </div>
  //                         ))
  //                     )}
  //                   </div>
  //                 </div>
  //               )
  //             })
  //         )}
  //       </div>
  //     </div>
  //   )
  // }

  // Table mode: use reusable TableComponent
  // Build columns: include Substage column then activity columns
  const tableColumns = [
    { id: 'substage', label: 'Substage', align: 'left' },
    ...filteredActivities
      .filter((act) => (selectedActivityKeys.size === 0 ? true : selectedActivityKeys.has(act.id)))
      .map((act) => ({ id: act.id, label: act.name, align: 'center' })),
  ]

  // Build rows: each substage becomes a row; activity columns contain checkbox elements
  const tableRows = visibleSubstages
    .filter((sub) => (selectedRowIds.size === 0 ? true : selectedRowIds.has(sub.substageId ?? sub.subStageId)))
    .map((sub) => {
      const subId = sub.substageId ?? sub.subStageId
      const acts = activitiesBySubstage[subId] || []
      const actsFiltered = (acts || []).filter((a) => {
        const rawId = a.activityId ?? a.activityid ?? a.activity_name ?? a.activityName
        const display = (a.activityName ?? a.activity_name ?? (rawId === undefined || rawId === null ? '' : String(rawId))).toString()
        return display.trim().length > 0
      })
      const present = new Set(
        actsFiltered.map((a) => {
          const rawId = a.activityId ?? a.activityid ?? a.activity_name ?? a.activityName
          const display = (a.activityName ?? a.activity_name ?? (rawId === undefined || rawId === null ? '' : String(rawId))).toString()
          return display.trim().toLowerCase()
        })
      )

      const row = {
        substage: sub.substageName ?? sub.subStageName ?? sub.substagename,
        createdAt: sub.createdAt || sub.timestamp || new Date().toISOString(),
      }

      tableColumns.slice(1).forEach((col) => {
        const actId = col.id
        const activityName = col.label
        const key = `${subId}_${actId}`
        const checked = present.has(String(actId).toLowerCase()) || present.has(String(activityName).toLowerCase())
        if (editMode) {
          row[actId] = (
            <input
              type="checkbox"
              className="h-4 w-4 accent-blue-600 focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
              checked={!!checked}
              disabled={!!pending[key]}
              onChange={async (e) => {
                const to = e.target.checked
                setPending((p) => ({ ...p, [key]: true }))
                try {
                  if (to) {
                    await dispatch(mapActivityToSubstage({ substageId: subId, activityName }))
                  } else {
                    await dispatch(unmapActivityFromSubstage({ substageId: subId, activityName }))
                  }
                } catch (err) {
                  console.error('mapping error', err)
                } finally {
                  setPending((p) => {
                    const c = { ...p }
                    delete c[key]
                    return c
                  })
                }
              }}
            />
          )
        } else {
          // Find the mapped activity for this substage and activity column
          const mapped = actsFiltered.find((a) => {
            const rawId = a.activityId ?? a.activityid ?? a.activity_name ?? a.activityName
            const display = (a.activityName ?? a.activity_name ?? (rawId === undefined || rawId === null ? '' : String(rawId))).toString().trim().toLowerCase()
            return display === actId || display === activityName.toLowerCase()
          })
          if (mapped && mapped.status) {
            let color = 'text-gray-400'
            let Icon = FaRegCircle
            let title = mapped.status
            if (mapped.status.toLowerCase() === 'completed') {
              color = 'text-green-500'
              Icon = FaCheckCircle
            } else if (mapped.status.toLowerCase() === 'pending') {
              color = 'text-yellow-400'
              Icon = FaRegCircle
            }
            // For info card popup, use a ref for the anchor
            const anchorRef = React.createRef()
            row[actId] = (
              <span title={title} className="flex items-center justify-center">
                <span
                  ref={anchorRef}
                  className="flex items-center rounded-full bg-gray-100 border border-gray-200 px-2 py-1 min-w-[70px] max-w-[120px] cursor-pointer hover:shadow"
                  onClick={() => setInfoCard({ key, reason: mapped.reason || mapped.statusReason || mapped.status_reason || 'No reason provided.', anchor: anchorRef, substageId: subId, activityName, currentStatus: mapped.status.toLowerCase() })}
                >
                  <span className={color + ' mr-2 flex items-center'}>
                    <Icon className="text-lg" />
                  </span>
                  <span className="text-xs text-gray-700 font-medium whitespace-nowrap pr-1">{mapped.status}</span>
                </span>
              </span>
            )
          } else {
            row[actId] = null
          }
        }
      })

      return row
    })

  return (
    <div className="flex flex-col gap-4 h-full p-2 relative">
      {Controls}
      <div className="flex-1 overflow-auto">
        {visibleSubstages.length === 0 ? (
          <div className="text-sm text-gray-500">No substages selected</div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-sm text-gray-500">No activities match your search</div>
        ) : (
          <TableComponent
            rows={tableRows}
            columns={tableColumns}
            itemKey="substage"
            itemLabel="substage"
            defaultSortOrder="newest"
            showSearchbar={false}
            showSortButton={false}
            showDownloadButton={false}
          />
        )}
        {infoCard.key && (
          <StatusInfoCard
            reason={infoCard.reason}
            anchorRef={infoCard.anchor}
            onClose={() => setInfoCard({ key: null, reason: '', anchor: null, substageId: null, activityName: '', currentStatus: '' })}
            onMarkCompleted={() => handleUpdateStatus(infoCard.substageId, infoCard.activityName, 'completed')}
            onMarkPending={() => handleUpdateStatus(infoCard.substageId, infoCard.activityName, 'pending')}
            currentStatus={infoCard.currentStatus}
          />
        )}
      </div>
    </div>
  )
}
