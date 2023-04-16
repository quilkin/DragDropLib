
<script setup>
import {ref, reactive, computed, onMounted, onBeforeMount } from 'vue'
import { Draggable  } from './draggable.js'


onMounted(() => {
 document.addEventListener('contextmenu', event => event.preventDefault());

 document.addEventListener('dropped', (e) => {
  console.log('dropped from ' + e.detail.from + ' to ' + e.detail.to);
  })
 document.addEventListener('swapped', (e) => {
  console.log('swapped from ' + e.detail.from + ' to ' + e.detail.to);
  })

 Draggable.init();
 Draggable.logging = true;
 Draggable.throttlePeriod = 150;
 Draggable.droppableBackground = 'lightblue'
 Draggable.draggableBackground = 'lightgreen'
 Draggable.nextFreeId = 10;
 console.log(Draggable.nextFreeId);

})

const movableGrid = reactive([])
const swappableGrid = reactive([])
const copyableGrid = reactive([])

function alpha(i)
{
  const alphabet = "ABCDEFGHJKLMNOPQRSTUVWXYZ"
  return alphabet[i]
}
function symbol(i)
{
  const symb = "£$%&#"
  return symb[i]
}
function createLists() {
      var index=1;
      for (var i = 0; i < 5; i++)
    {
        movableGrid[i] = [];
        for (var j = 0; j < 5; j++)
        {
            movableGrid[i][j] = {
                "name" : alpha(i*5+j),
                "id" : index,
                "used": false,
            };
            ++index;
        }
    }
		for (var i = 0; i < 5; i++)
		{
			swappableGrid[i] = [];
			for (var j = 0; j < 5; j++)
			{
				swappableGrid[i][j] = {
					"name" : i*5+j,
					"id" : index,
				};
				++index;
			}
		}
    for (var j = 0; j < 5; j++)
			{
				copyableGrid[j] = {
					"name" : symbol(j),
					"id" : index,
					};
				++index;
			}
    
}

onBeforeMount(() => {	
  createLists()	
});




const itemSize = 45;

function getStyle(pos,r,c) {
  var top = pos + r*itemSize 
  var style = "top: " + top  + "px; ";
  style +=    "left: " + (c*itemSize )  + "px; ";
  style +=    "width: " + itemSize + "px; position: absolute; z-index: 999";
  return style;
}
function getRowId(r) {
  return "r"+r;
}
// var onDropped = function(e)
// {
//     console.log(e.type + ' handled; data: ' + e.detail)
// }
</script>
<template>
  
<div align="center" class="box">
  <v-container  style="max-width: 250px;  position: relative;"> 
    <v-row v-for="(row,r) in movableGrid" 
      :id = getRowId(r) >
		  <template v-for="(chip,c) in row" :key="chip.id" >
          <v-chip size="x-large"  color="primary" class="movable changeclass"
            :style = getStyle(0,r,c)
            :id = chip.id
            >{{ chip.name}}
          </v-chip>
        </template>
    </v-row>
  </v-container>

  <v-container  style="max-width: 250px;  position: relative;"> 
    <v-row v-for="(row,r) in swappableGrid" 
    :id = getRowId(r) >
		  <template v-for="(chip,c) in row" :key="chip.id" >
          <v-chip size="x-large"  class="swappable droppable" 
            :style = getStyle(200,r,c)
            :id = chip.id
            :data-chip-name = chip.name
            >{{ chip.name}}
          </v-chip>
        </template>
    </v-row>
  </v-container>

  <v-container  style="max-width: 250px;  position: relative;"> 
    <v-row v-for="(chip,c) in copyableGrid" :key="chip.id" >
          <v-chip size="x-large" color ="secondary" class="copyable changeclass" 
            :style = getStyle(400,0,c)
            :id = chip.id
            >{{ chip.name}}
          </v-chip>
    </v-row>
  </v-container>
</div>

</template>

<style>
 .box {
      width: 99.5%;
      width: 400px;
      height: 99vh;
      padding: 1px;
      margin: 1px;
      border: 1px solid lightgray;
  }



#myContainer {
    touch-action: none;
    width: 100%;
    height: 100vh;
    padding: 1px;
    margin: 1px;
    border: 1px solid lightgray;
}
.v-chip {
  z-index: 999;
	justify-content: center;
 	-webkit-user-select: none; 
    -ms-user-select: none; 
    user-select: none; 
}
/* @media (min-width: 512px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

 
  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
} */
</style>
