local M = {}

local line_text

--- @class example
-- Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean accumsan dapibus ex,
-- duis tincidunt consectetur nisl at auctor. Mauris et dictum urna, ac maximus mi.
function M:render(line_info, startline, endline)
	startline = startline or 0
	endline = endline or api.nvim_buf_line_count(self.buffer)

	local lines = {}

	for index, line in pairs(line_info) do
		local line_no = index
		local column = 1

		if #line > 0 then
			for _, segment in ipairs(line) do
				table.insert(self.highlights, {
					range = { line_no, column, #segment.text },
					color_group = segment.color_group,
				})
				column = column + #segment.text
				line_text = line_text .. segment.text
			end
		else
			table.insert(self.highlights, {
				range = { line_no },
				color_group = line.color_group,
			})
			column = column + #line.text
			line_text = line_text .. line.text
		end

		table.insert(lines, line_text)
	end

	api.nvim_buf_set_lines(self.buffer, start_line, end_line, true, lines)
	self:_set_highlights()
end

return M
