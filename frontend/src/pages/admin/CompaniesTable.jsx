"use client"

import { Edit2, Trash2, Store, Mail, Calendar, ChevronDown, ChevronUp } from "lucide-react"

export function CompaniesTable({
  companies,
  expandedCompany,
  onExpandClick,
  onEditClick,
  onDeleteClick,
}) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
      {/* Table Header */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-muted border-b border-border">
        <div className="col-span-3">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Company</p>
        </div>
        <div className="col-span-2">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Email</p>
        </div>
        <div className="col-span-2">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Stores</p>
        </div>
        <div className="col-span-2">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Created</p>
        </div>
        <div className="col-span-3">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Actions</p>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-border">
        {companies.map((company) => (
          <div key={company._id} className="flex flex-col">
            {/* Main Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-4 px-4 md:px-6 py-4 md:py-5 items-center hover:bg-muted/50 transition-colors duration-150">
              {/* Company Name - Mobile & Desktop */}
              <div className="md:col-span-3 flex items-start gap-3">
                <div className="p-2.5 bg-primary/10 rounded-lg flex-shrink-0 hidden md:flex">
                  <Store className="text-primary" size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-card-foreground truncate text-sm md:text-base">{company.name}</h4>
                  <p className="text-xs md:text-sm text-muted-foreground truncate mt-1">{company.description || "-"}</p>
                </div>
              </div>

              {/* Email */}
              <div className="md:col-span-2 hidden md:flex items-center gap-2 text-sm">
                <Mail size={16} className="text-muted-foreground flex-shrink-0" />
                <span className="truncate text-muted-foreground">{company.email}</span>
              </div>

              {/* Stores Count */}
              <div className="md:col-span-2 flex items-center">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                  {company.stores?.length || 0} stores
                </span>
              </div>

              {/* Created Date */}
              <div className="md:col-span-2 hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar size={16} className="flex-shrink-0" />
                {formatDate(company.createdAt)}
              </div>

              {/* Actions */}
              <div className="md:col-span-3 flex items-center gap-2 justify-end">
                <button
                  onClick={() => onEditClick(company)}
                  className="p-2 hover:bg-primary/10 text-primary rounded-md transition-colors duration-150"
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => onDeleteClick(company)}
                  className="p-2 hover:bg-destructive/10 text-destructive rounded-md transition-colors duration-150"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
                {company.stores && company.stores.length > 0 && (
                  <button
                    onClick={() => onExpandClick(company._id)}
                    className="p-2 hover:bg-muted rounded-md transition-colors duration-150 text-muted-foreground"
                    title="Toggle stores"
                  >
                    {expandedCompany === company._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                )}
              </div>
            </div>

            {/* Expanded Stores View */}
            {expandedCompany === company._id && company.stores && company.stores.length > 0 && (
              <div className="bg-muted/30 border-t border-border px-4 md:px-6 py-4 animate-in slide-in-from-top duration-200">
                <h5 className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
                  <Store size={14} className="text-primary" />
                  Store Locations ({company.stores.length})
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {company.stores.map((store) => (
                    <div
                      key={store._id}
                      className="p-3 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors"
                    >
                      <p className="font-medium text-sm text-card-foreground">{store.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{store.location}</p>
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Mail size={12} />
                        <span className="truncate">{store.email}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
